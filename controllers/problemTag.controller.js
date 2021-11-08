const db = require("../models")
const Problem = db.problem
const ProblemTag = db.problemTag
const Op = db.Sequelize.Op

exports.createTag = async (req, res) => {
    try {
        const tag = await ProblemTag.create(req.body)
        res.send(tag)
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }

}


exports.findAll = async (req, res) => {
    try {
        const tags = await ProblemTag.findAll({
            where: { 
                delFlag: false,
            }
        })
        res.send(tags)
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}