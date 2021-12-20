const db = require("../models")
const Problem = db.problem
const User = db.user
const Submission = db.submission
const ProblemTag = db.problemTag
const Op = db.Sequelize.Op
const JSZip = require("jszip")
const fs = require("fs")


const zipPath = "http://localhost:8080/zip_files/"

const validateZipFile = (req, res) => {
    try {
        const zipFile = req.file
        //check if file is valid        
        if (!zipFile.mimetype.includes('zip')) {
            removeTmp(zipFile.path)
            return res.status(400).send({
                message: 'Only zip file is allowed'
            })
        }

        //check if file size is less than 50mb
        if (zipFile.size > 1024 * 1024 * 50) {
            removeTmp(zipFile.path)
            return res.status(400).send({
                message: 'File size too large'
            })
        }

        const jsZip = new JSZip()
        return new Promise((resolve, reject) => {
            fs.readFile(zipFile.path, function (err, data) {
                console.log(data)
                if (err) removeTmp(zipFile.path)
                jsZip.loadAsync(data)
                    .then((zip) => {

                        let foundIn = 0
                        let foundOut = 0
                        zip.forEach((relPath, file) => {
                            if (!foundIn && relPath.endsWith('.in')) {
                                foundIn += 1
                                zip.forEach((relPathOut) => {
                                    if (relPathOut.endsWith('.out') && relPathOut.startsWith(relPath.substring(0, relPath.length - 3))) {
                                        foundOut += 1
                                    }
                                })
                            }
                        })

                        if (foundIn === 0 || foundOut === 0) {
                            reject(new Error("No input file or output file found in ZIP archive."))

                        }
                        if (foundIn !== foundOut) {
                            reject(new Error("No input file or output file found in ZIP archive"))
                        }

                        resolve("ok")
                    }).catch(err => {
                        removeTmp(zipFile.path)
                        return res.status(400).send({ message: "An error has occurred" })
                    })
            })

        })
    }
    catch (error) {
        return res.status(500).send({ message: err.message })
    }
}


exports.validateZip = async (req, res) => {
    try {
        if (req.file) {
            validateZipFile(req, res).then(() => {
                removeTmp(req.file.path)
                res.send({ message: "Zip file is valid" })
            }).catch(err => {
                res.status(400).send({ message: err.message })
            })
        }
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.findAllByAdmin = async (req, res) => {
    try {
        const { searchTitle } = req.query
        var titleCondition = searchTitle ? { title: { [Op.iLike]: `%${searchTitle}%` } } : null
        //find add problems for admin
        const problems = await Problem.findAll({
            where: {
                [Op.and]: [
                    titleCondition,
                    { delFlag: false }
                ]
            },
        })

        res.send(problems)
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}


exports.findAllByTeacher = async (req, res) => {
    try {
        const { searchTitle } = req.query
        var titleCondition = searchTitle ? { title: { [Op.iLike]: `%${searchTitle}%` } } : null
        //find add problems for admin
        const problems = await Problem.findAll({
            where: {
                [Op.and]: [
                    titleCondition,
                    {
                        [Op.or]: [
                            { visibleMode: "public" },
                            { author: req.user.username }
                        ]
                    },
                    { delFlag: false }
                ]
            },
        })
        res.send(problems)
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.findAllByUser = async (req, res) => {
    try {
        const { searchContent, searchAuthor, searchDifficulty } = req.query
        var contentCondition = searchContent ? { statement: { [Op.iLike]: `%${searchContent}%` } } : null
        var titleCondition = searchContent ? { title: { [Op.iLike]: `%${searchContent}%` } } : null
        var authorCondition = searchAuthor ? { author: { [Op.iLike]: `%${searchAuthor}%` } } : null
        var difficultyCondition = searchDifficulty ? { difficulty: { [Op.iLike]: `%${searchDifficulty}%` } } : null

        if(searchContent) {
            const problems = await Problem.findAll({
                where: {
                    [Op.and]: [
                        { delFlag: false },
                        { visibleMode: "public" },
                        authorCondition,
                        difficultyCondition
                    ],
                    [Op.or]: [
                        contentCondition,
                        titleCondition,
                    ]
                },
                group: ['problem.id'],
                includeIgnoreAttributes: false,
                attributes: [
                    "id",
                    "title",
                    "author",
                    "difficulty",
                    "createdAt",
                    [db.Sequelize.fn('COUNT', db.Sequelize.col("submissions.id")), "tries"]
                ],
                include: [
                    {
                        model: Submission,
                        atributes: [
                            ['id']
                        ]
                    }
                ],
                
            }).catch(err => console.log(err))
            
            const item = await Problem.findAll({
                attributes: [
                    "id",
                    [db.Sequelize.fn('COUNT', db.Sequelize.col("submissions.id")), "correctCount"]
                ],
                group: ['problem.id'],
                includeIgnoreAttributes: false,
                include: [
                    {
                        model: Submission,
                        attributes: ['id'],
                        where: {
                            delFlag: false,
                            verdict: 'Correct'
                        }
                    }
                ],

            }).catch(err => console.log(err))

            for(i = 0; i < problems.length; i++) {
                problems[i].dataValues.correctCount = 0
                for(j = 0; j < item.length; j++) {
                    if(problems[i].dataValues.id == item[j].dataValues.id) {
                        problems[i].dataValues.correctCount = item[j].dataValues.correctCount
                    }
                }
            }

            res.send(problems)
        }
        else {
            const problems = await Problem.findAll({
                where: {
                    [Op.and]: [
                        { delFlag: false },
                        { visibleMode: "public" },
                        authorCondition,
                        difficultyCondition
                    ]
                },
                group: ['problem.id'],
                includeIgnoreAttributes: false,
                attributes: [
                    "id",
                    "title",
                    "author",
                    "difficulty",
                    "createdAt",
                    [db.Sequelize.fn('COUNT', db.Sequelize.col("submissions.id")), "tries"]
                ],
                include: [
                    {
                        model: Submission,
                        atributes: [
                            ['id']
                        ]
                    }
                ],
                
            })

            const item = await Problem.findAll({
                attributes: [
                    "id",
                    [db.Sequelize.fn('COUNT', db.Sequelize.col("submissions.id")), "correctCount"]
                ],
                group: ['problem.id'],
                includeIgnoreAttributes: false,
                include: [
                    {
                        model: Submission,
                        attributes: ['id'],
                        where: {
                            delFlag: false,
                            verdict: 'Correct'
                        }
                    }
                ],

            }).catch(err => console.log(err))

            for(i = 0; i < problems.length; i++) {
                problems[i].dataValues.correctCount = 0
                for(j = 0; j < item.length; j++) {
                    if(problems[i].dataValues.id == item[j].dataValues.id) {
                        problems[i].dataValues.correctCount = item[j].dataValues.correctCount
                    }
                }
            }

            
            res.send(problems)
        }
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}


exports.createProblem = async (req, res) => {
    try {
        if (!req.body.title || !req.body.statement) return res.status(400).send({ message: "Title and statement are required" })

        if (req.file) {
            validateZipFile(req, res).then(async () => {
                const problem = await Problem.create({
                    author: req.user.username,
                    title: req.body.title,
                    statement: req.body.statement,
                    timeLimit: req.body.timeLimit === "null" || req.body.timeLimit === '' ? 1 : req.body.timeLimit,
                    memoryLimit: req.body.memoryLimit === "null" || req.body.memoryLimit === '' ? null : parseInt(req.body.memoryLimit),
                    visibleMode: req.body.visibleMode,
                    difficulty: req.body.difficulty === "null" ? null : req.body.difficulty,
                    testDataURL: zipPath + req.file.path,
                })

                const problemTags = JSON.parse(req.body.problemTags)

                if (problemTags) {
                    problemTags.forEach(async (tag) => {
                        const problemTag = await ProblemTag.findByPk(tag.id)
                        if (problemTag) {
                            await problem.addProblemTag(problemTag)
                        }
                    })
                }
                res.send({ message: "Create Success" })
            }).catch(err => {
                removeTmp(req.file.path)
                res.status(400).send({ message: err.message })
            })
        }
        else {
            const problem = await Problem.create({
                author: req.user.username,
                title: req.body.title,
                statement: req.body.statement,
                timeLimit: req.body.timeLimit === "null" || req.body.timeLimit === '' ? 1 : req.body.timeLimit,
                memoryLimit: req.body.memoryLimit === "null" || req.body.memoryLimit === '' ? null : parseInt(req.body.memoryLimit),
                visibleMode: req.body.visibleMode,
                difficulty: req.body.difficulty === "null" ? null : req.body.difficulty,
            })
            const problemTags = JSON.parse(req.body.problemTags)

            if (problemTags) {
                problemTags.forEach(async (tag) => {
                    const problemTag = await ProblemTag.findByPk(tag.id)
                    if (problemTag) {
                        await problem.addProblemTag(problemTag)
                    }
                })
            }
            res.send({ message: "Create Success" })
        }
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.findOneByAdmin = async (req, res) => {
    try {
        const problem = await Problem.findOne(
            {
                where: {
                    id: req.params.id,
                    delFlag: false
                },
                include: [{
                    model: ProblemTag,
                    through: {
                        attributes: []
                    }
                }]
            })

        if (!problem) return res.status(404).send({ message: "Problem not found" })
        res.send(problem)
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.findOneByTeacher = async (req, res) => {
    try {

        const problem = await Problem.findOne(
            {
                where: {
                    id: req.params.id,
                    delFlag: false,
                },
                include: [{
                    model: ProblemTag,
                    through: {
                        attributes: []
                    }
                }]
            })

        if (!problem) return res.status(404).send({ message: "Problem not found" })

        if (problem.visibleMode !== "public" && problem.author !== req.user.username) return res.status(400).send({ message: "Problem not found" })

        res.send(problem)
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.findOneByUser = async (req, res) => {
    try {
        const problem = await Problem.findOne(
            {
                where: {
                    id: req.params.id,
                    delFlag: false,
                    visibleMode: "public"
                },
                include: [{
                    model: ProblemTag,
                    through: {
                        attributes: []
                    }
                }]
            })

        if (!problem) return res.status(404).send({ message: "Problem not found" })

        res.send(problem)
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}



exports.updateOneByAdmin = async (req, res) => {
    try {
        if (!req.body.title || !req.body.statement) return res.status(400).send({ message: "Title and statement are required" })
        const problem = await Problem.findByPk(req.params.id)
        if (!problem) return res.status(404).send({ message: "Problem not found" })

        if (req.file) {
            validateZipFile(req, res).then(async () => {
                const existedTagsInProblem = await ProblemTag.findAll({
                    where: {
                        delFlag: false
                    },
                    include: [{
                        model: Problem,
                        attributes: [],
                        where: {
                            id: req.params.id
                        }
                    }]
                })

                if (existedTagsInProblem.length > 0) {
                    existedTagsInProblem.forEach(async (tag) => {
                        await tag.removeProblem(req.params.id).catch(err => { console.log(err) })
                    })
                }

                const testDataURL = req.file ? zipPath + req.file.path : req.body.testDataURL === "null" ? null : req.body.testDataURL
                console.log(req.body.statement)
                await Problem.update({
                    title: req.body.title,
                    statement: req.body.statement,
                    timeLimit: req.body.timeLimit === "null" || req.body.timeLimit === '' ? 1 : req.body.timeLimit,
                    memoryLimit: req.body.memoryLimit === "null" || req.body.memoryLimit === '' ? null : parseInt(req.body.memoryLimit),
                    visibleMode: req.body.visibleMode,
                    difficulty: req.body.difficulty === "null" ? null : req.body.difficulty,
                    testDataURL: testDataURL
                },
                    {
                        where: {
                            id: req.params.id,
                        }
                    })

                const problemTags = JSON.parse(req.body.problemTags)
                if (problemTags) {
                    problemTags.forEach(async (tag) => {
                        const problemTag = await ProblemTag.findByPk(tag.id)
                        if (problemTag) {
                            await problem.addProblemTag(problemTag)
                        }
                    })
                }

                res.send({ message: "Update success" })
            }).catch(err => {
                removeTmp(req.file.path)
                return res.status(400).send({ message: err.message })
            })
        }
        else {
            const existedTagsInProblem = await ProblemTag.findAll({
                where: {
                    delFlag: false
                },
                include: [{
                    model: Problem,
                    attributes: [],
                    where: {
                        id: req.params.id
                    }
                }]
            })

            if (existedTagsInProblem.length > 0) {
                existedTagsInProblem.forEach(async (tag) => {
                    await tag.removeProblem(req.params.id).catch(err => { console.log(err) })
                })
            }

            const testDataURL = req.body.testDataURL === "null" ? null : req.body.testDataURL
            console.log(req.body.statement)

            await Problem.update({
                title: req.body.title,
                statement: req.body.statement,
                timeLimit: req.body.timeLimit === "null" || req.body.timeLimit === '' ? 1 : req.body.timeLimit,
                memoryLimit: req.body.memoryLimit === "null" || req.body.memoryLimit === '' ? null : parseInt(req.body.memoryLimit),
                visibleMode: req.body.visibleMode,
                difficulty: req.body.difficulty === "null" ? null : req.body.difficulty,
                testDataURL: testDataURL
            },
                {
                    where: {
                        id: req.params.id,
                    }
                })

            const problemTags = JSON.parse(req.body.problemTags)
            if (problemTags) {
                problemTags.forEach(async (tag) => {
                    const problemTag = await ProblemTag.findByPk(tag.id)
                    if (problemTag) {
                        await problem.addProblemTag(problemTag)
                    }
                })
            }

            res.send({ message: "Update success" })
        }

    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
}

exports.updateOneByTeacher = async (req, res) => {
    try {
        if (!req.body.title || !req.body.statement) return res.status(400).send({ message: "Title and statement are required" })
        const problem = await Problem.findOne(
            {
                where: {
                    id: req.params.id,
                    delFlag: false,
                }
            })
        if (!problem) return res.status(404).send({ message: "Problem not found" })

        if (problem.author !== req.user.username) return res.status(404).send({ message: "Do not permission" })

        if (req.file) {
            validateZipFile(req, res).then(async () => {
                const existedTagsInProblem = await ProblemTag.findAll({
                    where: {
                        delFlag: false
                    },
                    include: [{
                        model: Problem,
                        attributes: [],
                        where: {
                            id: req.params.id
                        }
                    }]
                })

                if (existedTagsInProblem.length > 0) {
                    existedTagsInProblem.forEach(async (tag) => {
                        await tag.removeProblem(req.params.id).catch(err => { console.log(err) })
                    })
                }

                const testDataURL = req.file ? zipPath + req.file.path : req.body.testDataURL === "null" ? null : req.body.testDataURL

                await Problem.update({
                    title: req.body.title,
                    statement: req.body.statement,
                    timeLimit: req.body.timeLimit === "null" || req.body.timeLimit === '' ? 1 : req.body.timeLimit,
                    memoryLimit: req.body.memoryLimit === "null" || req.body.memoryLimit === '' ? null : parseInt(req.body.memoryLimit),
                    visibleMode: req.body.visibleMode,
                    difficulty: req.body.difficulty === "null" ? null : req.body.difficulty,
                    testDataURL: testDataURL
                },
                    {
                        where: {
                            id: req.params.id,
                        }
                    })

                const problemTags = JSON.parse(req.body.problemTags)
                if (problemTags) {
                    problemTags.forEach(async (tag) => {
                        const problemTag = await ProblemTag.findByPk(tag.id)
                        if (problemTag) {
                            await problem.addProblemTag(problemTag)
                        }
                    })
                }

                res.send({ message: "Update success" })
            }).catch(err => {
                removeTmp(req.file.path)
                return res.status(400).send({ message: err.message })
            })
        }
        else {
            const existedTagsInProblem = await ProblemTag.findAll({
                where: {
                    delFlag: false
                },
                include: [{
                    model: Problem,
                    attributes: [],
                    where: {
                        id: req.params.id
                    }
                }]
            })

            if (existedTagsInProblem.length > 0) {
                existedTagsInProblem.forEach(async (tag) => {
                    await tag.removeProblem(req.params.id).catch(err => { console.log(err) })
                })
            }

            const testDataURL = req.body.testDataURL === "null" ? null : req.body.testDataURL

            await Problem.update({
                title: req.body.title,
                statement: req.body.statement,
                timeLimit: req.body.timeLimit === "null" || req.body.timeLimit === '' ? 1 : req.body.timeLimit,
                memoryLimit: req.body.memoryLimit === "null" || req.body.memoryLimit === '' ? null : parseInt(req.body.memoryLimit),
                visibleMode: req.body.visibleMode,
                difficulty: req.body.difficulty === "null" ? null : req.body.difficulty,
                testDataURL: testDataURL
            },
                {
                    where: {
                        id: req.params.id,
                    }
                })

            const problemTags = JSON.parse(req.body.problemTags)
            if (problemTags) {
                problemTags.forEach(async (tag) => {
                    const problemTag = await ProblemTag.findByPk(tag.id)
                    if (problemTag) {
                        await problem.addProblemTag(problemTag)
                    }
                })
            }

            res.send({ message: "Update success" })
        }

    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
}

exports.deleteByAdmin = async (req, res) => {
    try {
        const problem = await Problem.findByPk(req.params.id)
        if (!problem) return res.status(404).send({ message: "Problem not found" })
        //delete problem, change delFlag to true
        await Problem.update({
            delFlag: true
        },
            {
                where: {
                    id: req.params.id
                }
            })
        res.send({ message: "Delete success" })
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.deleteByTeacher = async (req, res) => {
    try {
        const problem = await Problem.findOne({
            where: {
                id: req.params.id,
                delFlag: false,
            }
        })
        if (!problem) return res.status(404).send({ message: "Problem not found" })
        if (problem.author !== req.user.username) return res.status(404).send({ message: "Do not permission" })

        //delete problem, change delFlag to true
        await Problem.update({
            delFlag: true
        },
            {
                where: {
                    id: req.params.id
                }
            })
        res.send({ message: "Delete success" })
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

const removeTmp = (path) => {
    fs.unlink(path, err => {
        if (err) throw err
    })
}