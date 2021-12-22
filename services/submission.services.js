const db = require('../models')
const Submission = db.submission
const Problem = db.problem
const Op = db.Sequelize.Op

const SubmissionService = {
    findAllByUser: async (searchContent, searchAuthor, searchVerdict, searchLanguage) => {
        var contentCondition = searchContent ? { statement: { [Op.iLike]: `%${searchContent}%` } } : null
        var titleCondition = searchContent ? { title: { [Op.iLike]: `%${searchContent}%` } } : null
        var authorCondition = searchAuthor ? { author: { [Op.iLike]: `%${searchAuthor}%` } } : null
        var verdictCondition = searchVerdict ? { verdict: { [Op.iLike]: `%${searchVerdict}%` } } : null
        var languageCondition = searchLanguage ? { language: { [Op.iLike]: `%${searchLanguage}%` } } : null

        //Submission of public problems
        if (searchContent) {
            return await Submission.findAll(
                {
                    attributes: ["id", "verdict", "language", "author", "createdAt"],
                    where: {
                        [Op.and]: [
                            verdictCondition,
                            languageCondition,
                            authorCondition
                        ],
                        delFlag: false,
                    },
                    order: [
                        ['createdAt', 'DESC']
                    ],
                    include: [
                        {
                            model: Problem,
                            attributes: [
                                "title"
                            ],
                            where: {
                                [Op.or]: [
                                    contentCondition,
                                    titleCondition,
                                ],
                                [Op.and]: [
                                    { delFlag: false },
                                    { visibleMode: "public" }
                                ]
                            }
                        }
                    ]
                }
            )
        }
        else {
            return await Submission.findAll(
                {
                    attributes: ["id", "verdict", "language", "author", "createdAt"],
                    where: {
                        [Op.and]: [
                            verdictCondition,
                            languageCondition,
                            authorCondition
                        ],
                        delFlag: false,
                    },
                    order: [
                        ['createdAt', 'DESC']
                    ],
                    include: [
                        {
                            model: Problem,
                            attributes: [
                                "title"
                            ],
                            where: {
                                [Op.and]: [
                                    { delFlag: false },
                                    { visibleMode: "public" }
                                ]
                            }

                        }
                    ]
                }
            )
        }

    },

    findAllByAdmin: async (searchText) => {
        //Stands for “is Not a Number”
        var authorCondition = searchText ? { author: { [Op.iLike]: `%${searchText}%` } } : null
        if(isNaN(searchText)) {
            var problemIdCondition = null
        }
        else {
            var problemIdCondition = searchText ? { problemId: { [Op.eq]: parseInt(searchText) } } : null
        }
              
        if(searchText) {
            return await Submission.findAll(
                {
                    attributes: ["id", "verdict", "language", "author", "createdAt", "problemId"],
                    where: {
                        [Op.or]: [
                            problemIdCondition,
                            authorCondition
                        ],
                        delFlag: false,
                    },
                    order: [
                        ['createdAt', 'DESC']
                    ],
                    include: [
                        {
                            model: Problem,
                            attributes: [],
                            where: {
                                delFlag: false
                            }
                        }
                    ]
                }
            ).catch(err => console.log(err))
        }
        else {
            return await Submission.findAll(
                {
                    attributes: ["id", "verdict", "language", "author", "createdAt", "problemId"],
                    where: {
                        delFlag: false,
                    },
                    order: [
                        ['createdAt', 'DESC']
                    ],
                    include: [
                        {
                            model: Problem,
                            attributes: [],
                            where: {
                                delFlag: false
                            }
                        }
                    ]
                }
            )
        }
    },

    updateVerdictAndOutput: async (id, newVerdict, newOutput) => {
        return await Submission.update(
            {
                verdict: newVerdict,
                output: newOutput
            },
            {
                where: {
                    id: id
                }
            })
    },

    findOneByUser: async (id) => {
        return await Submission.findByPk(id, {
            attributes: ["id", "verdict", "language", "author", "createdAt", "problemId", "source", "output"],
            include: [
                {
                    model: Problem,
                    attributes: [],
                    where: {
                        [Op.and]: [
                            { delFlag: false },
                            { visibleMode: "public" }
                        ]
                    }
                }
            ]
        })
    },

    findOneByAdmin: async (id) => {
        return await Submission.findByPk(id, {
            attributes: ["id", "verdict", "language", "author", "createdAt", "problemId", "source"],
            include: [
                {
                    model: Problem,
                    attributes: [],
                    where: {
                        delFlag: false
                    }
                }
            ]
        })
    },

    findOneByTeacher: async (id) => {
        return await Submission.findByPk(id, {
            attributes: ["id", "verdict", "language", "author", "createdAt", "problemId", "source"],
            include: [
                {
                    model: Problem,
                    attributes: [],
                    where: {
                        delFlag: false,
                        visibleMode: "public"
                    }
                }
            ]
        })
    },

    deleteOneByAdmin: async (id) => {

        const submission = await Submission.findByPk(id)
        if (!submission) return null
        
        return await await Submission.update({
            delFlag: true
        },
        {
            where: {
                id: id
            }
        })
    },
}

module.exports = SubmissionService