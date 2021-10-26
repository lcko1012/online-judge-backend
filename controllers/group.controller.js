const db = require("../models")
const Group = db.group
const Op = db.Sequelize.Op

exports.findAll = async (req, res) => {
    try {  
        res.send({
            message: "Find all group"
        })
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.createGroup = async (req, res) => {
    try {

        res.send({message: "Create success!"})
        
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.findOne = async (req, res) => {
    try {
        res.send({
            message: "Can view all groups in detail"
        })
        
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}


exports.updateOneByAdmin = async (req, res) => {
    try {
        res.send({
            message: "Update success!"
        })
        
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}


exports.updateOneByTeacher = async (req, res) => {
    try {

        res.send({
            message: "Can update group is created by them , Update success!"
        })
        
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.deleteGroupByAdmin = async (req, res) => {
    try {
       
        res.send({
            message: "Delete success!"
        })
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.deleteGroupByTeacher = async (req, res) => {
    try {
       
        res.send({
            message: "Can delete group is created by them, Delete success!"
        })
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}


exports.searchGroup = async (req, res) => {
    try {
        res.send({
            message: "Search group's name, creator"
        })
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}





