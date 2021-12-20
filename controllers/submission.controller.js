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
                .then((zip) => {
                    const testArray = []
                    zip.forEach((relPath, file) => {
                        if (relPath.endsWith('.in')) {
                            zip.forEach((relPathOut) => {
                                if (relPathOut.endsWith('.out') && relPathOut.startsWith(relPath.substring(0, relPath.length - 3))) {
                                    testArray.push({
                                        input: zip.file(relPath).async("string"),
                                        output: zip.file(relPathOut).async("string")
                                    })
                                }
                            })
                        }
                    })
                    return Promise.all(testArray);
                })
                .then(async (data) => {
                    const results = []
                    const promises = data.map(async (test) => {
                        test.input = await test.input.then((dataIn) => { return dataIn })
                        test.output = await test.output.then((dataOut) => { return dataOut })
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
                        })
                    })

                    // return data is an array of tokens
                    const response = await axios.post("https://ce.judge0.com/submissions/batch?base64_encoded=true&wait=true", {
                        "submissions": submissions
                    })

                    let stringToken = ""
                    
                    for(let i = 0; i < response.data.length-1; i++){
                        stringToken = response.data[i].token.concat(",", response.data[i+1].token)
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
        submissionTokenResults.data.submissions.map(async (sub) => {
            if(sub.status.description === "Accepted") {
                resultVerdict = "Correct"
            }
            else if(sub.status.description === "Wrong Answer") {
                resultVerdict = "Wrong"
            }
            else {
                resultVerdict = sub.status.description
            }
        })
        
        await submissionService.updateVerdictAndOutput(id, resultVerdict, submissionTokenResults.data.submissions)

        const submissionList = await submissionService.findAll()
        res.send(submissionList)

    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}


