const axios = require('axios')
const db = require("../models")
const Problem = db.problem
const Submission = db.submission
const JSZip = require("jszip")
const fs = require("fs")
const submissionService = require("../services/submission.services")

const zipPath = "http://localhost:8080/zip_files/"

const checkLanguage = (id) => {
    switch (id) {
        case 63:
            return "Javascript"
        case 62:
            return "Java"
        case 54:
            return "C++"
        case 71:
            return "Python"
        default:
            return "Javascript"
    }
}

exports.submitCode = async (req, res) => {
    try {
        const { id } = req.params
        if(!req.body.source_code || !req.body.language_id) {
            return res.status(400).send({ message: "Source Code can not be empty" })
        } 
        const problem = await Problem.findOne(
            {
                attributes: ["timeLimit", "memoryLimit", "testDataURL"],
                where: {
                    id: id,
                    delFlag: false,
                    visibleMode: "public"
                }
            })

        if (!problem) return res.status(404).send({ message: "Problem not found" })

        const testDataURL = problem.testDataURL.slice(zipPath.length, problem.testDataURL.length)

        const jsZip = new JSZip()
        fs.readFile(testDataURL, function (err, data) {
            
            jsZip.loadAsync(data)
                .then( async (zip) => {
                    const testArray = []
                    const promises = []
                    zip.forEach((relPath, file) => {
                        if (relPath.endsWith('.in')) {
                            zip.forEach( async (relPathOut, fileOut) => {
                                if (relPathOut.endsWith('.out') && relPathOut.substring(0, relPathOut.lastIndexOf(".")) === relPath.substring(0, relPath.lastIndexOf("."))) {
                                    const inPromise = file.async('string')
                                    const outPromise = fileOut.async('string')
                                    promises.push(inPromise)
                                    promises.push(outPromise)
                                    testArray.push({
                                        fileIn: relPath,
                                        fileOut: relPathOut,
                                        input: await inPromise,
                                        output: await outPromise    
                                    })
                                }
                            })
                        }
                    })
                    await Promise.all(promises)
                    return testArray
                })
                .then(async (data) => {
                    const results = []
                    const promises = data.map(async (test) => {
                        results.push({
                            input: test.input,
                            output: test.output
                        })
                    })
                    await Promise.all(promises)

                    const submissions = []
                    results.map((result) => {
                        submissions.push({
                            language_id: req.body.language_id,
                            source_code: req.body.source_code,
                            stdin: Buffer.from(result.input).toString('base64'),
                            expected_output: Buffer.from(result.output).toString('base64'),
                            cpu_time_limit: problem.timeLimit.toString(),
                            memory_limit: (problem.memoryLimit*1024).toString(),
                            max_queue_size: 1000
                        })
                    })
                    // return data is an array of tokens
                    const response = await axios.post("https://ce.judge0.com/submissions/batch?base64_encoded=true&wait=true", {
                        "submissions": submissions
                    })

                    let stringToken = response.data[0].token
                    
                    for(let i = 0; i < response.data.length-1; i++){
                        stringToken = stringToken.concat(",", response.data[i+1].token)
                    }
                    
                    await Submission.create({
                        problemId: id,
                        author: req.user.username,
                        verdict: "Processing",
                        tokens: stringToken,
                        language: checkLanguage(req.body.language_id),
                        source: req.body.source_code
                    })

                    res.send({message: "Submission success"})
                })
                .catch(err => {
                    console.log(err)
                    return res.status(400).send({ message: "An error has occurred" })
                })
        })
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.findOneByUser = async (req, res) => {
    try {
        const submission = await submissionService.findOneByUser(req.params.id)
        if(submission === null) return res.status(404).send({ message: "Submission not found" })
        res.send(submission)
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}


exports.findOneByAdmin = async (req, res) => {
    try {
        const submission = await submissionService.findOneByAdmin(req.params.id)
        if(submission === null) return res.status(404).send({ message: "Submission not found" })
        res.send(submission)
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.findOneByTeacher = async (req, res) => {
    try {
        const submission = await submissionService.findOneByTeacher(req.params.id)
        if(submission === null) return res.status(404).send({ message: "Submission not found" })
        res.send(submission)
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}



exports.findAllByUser = async (req, res) => {
    try {
        const { searchContent, searchAuthor, searchVerdict, searchLanguage } = req.query
        const submissionList = await submissionService.findAllByUser(searchContent, searchAuthor, searchVerdict, searchLanguage)
        res.send(submissionList)
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.findAllByAdmin = async (req, res) => {
    try {
        const submissionList = await submissionService.findAllByAdmin(req.query.searchText)
        res.send(submissionList)
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}


exports.deleteOneByAdmin = async (req, res) => {
    try {
        const result = await submissionService.deleteOneByAdmin(req.params.id)
        if(result === null) {
            res.status(404).send({ message: "Submission not found" })
        }
        res.send({ message: "Submission deleted" })
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.updateVerdict = async (req, res) => {
    try {
        const { id } = req.params
    
        const submission = await Submission.findOne({
            where: {
                id: id
            }
        })
        const submissionTokenResults = await axios.get(`https://ce.judge0.com/submissions/batch?tokens=${submission.tokens}&base64_encoded=false&fields=token,stdout,status_id,language_id,status,time,memory`)
        let resultVerdict = ""
        let isProcessing = false
        let isCorrect = true

        for(var i=0; i<submissionTokenResults.data.submissions.length; i++) {
            console.log(submissionTokenResults.data.submissions[i].status.description)
            if(submissionTokenResults.data.submissions[i].status.description === "Processing" || submissionTokenResults.data.submissions[i].status.description === "In Queue") {
                isProcessing = true
            }
            if(submissionTokenResults.data.submissions[i].status.description === "Accepted" && isCorrect) {
                resultVerdict = "Correct"
            }
            else if(submissionTokenResults.data.submissions[i].status.description === "Wrong Answer") {
                resultVerdict = "Wrong"
                isCorrect = false
            }
            else if (submissionTokenResults.data.submissions[i].status.description !== "Accepted"){
                resultVerdict = submissionTokenResults.data.submissions[i].status.description
                isCorrect = false
            }
        }
        
        if(isProcessing === false) {
            await submissionService.updateVerdictAndOutput(id, resultVerdict, submissionTokenResults.data.submissions)
        }
        
        const submissionList = await submissionService.findAllByUser()
        res.send(submissionList)

    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: err.message })
    }
}


