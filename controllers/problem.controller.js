const db = require("../models")
const Problem = db.problem
const Op = db.Sequelize.Op

exports.findAllByAdmin = async (req, res) => {
    try {
        
        res.send({message: "Find all by admin"})
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}


exports.findAllByTeacher = async (req, res) => {
    try {
        
        res.send({message: "Publish, own problems"})
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.createProblem = async (req, res) => {
    try {
        
        res.send({message: "Create"})
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.findOneByAdmin = async (req, res) => {
    try {
        
        res.send({message: "Can find all problem"})
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.findOneByTeacher = async (req, res) => {
    try {
        res.send({message: "Only view theirs problem in detail"})
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}


exports.updateOneByAdmin = async (req, res) => {
    try {
        
        res.send({message: "Can update all problems"})
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.updateOneByTeacher = async (req, res) => {
    try {
        
        res.send({message: "Only update theirs problem"})
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.deleteByAdmin = async (req, res) => {
    try {
        
        res.send({message: "Can delete all problems"})
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.deleteByTeacher = async (req, res) => {
    try {
        
        res.send({message: "Only delete theirs problem"})
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}




