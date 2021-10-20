const db = require("../models")
const Post = db.post
const Op = db.Sequelize.Op

exports.findAllByAdmin = async (req, res) => {
    try {
        res.send({
            message: "get all posts by admin"
        })
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.findAllByTeacher = async (req, res) => {
    try {
        res.send({
            message: "get public posts and my own by teacher"
        })
        
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.findAllByUser = async (req, res) => {
    try {
        res.send({
            message: "get public post by user"
        })
        
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}


exports.findOneByAdmin = async (req, res) => {
    try {
        res.send({
            message: "get one post"
        })
        
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.findOneByTeacher = async (req, res) => {
    try {
        res.send({
            message: "get one public, teacher's post"
        })
        
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}


exports.findOneByUser = async (req, res) => {
    try {
        res.send({
            message: "get one public post"
        })
        
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}


exports.updateOneByAdmin = async (req, res) => {
    try {
        res.send({
            message: "update post"
        })
        
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}


exports.updateOneByTeacher = async (req, res) => {
    try {
        res.send({
            message: "just update teacher's post "
        })
        
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.updateOneByTeacher = async (req, res) => {
    try {
        res.send({
            message: "just update teacher's post "
        })
        
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.updateOneByTeacher = async (req, res) => {
    try {
        res.send({
            message: "just update teacher's post "
        })
        
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.createPost = async (req, res) => {
    try {
        res.send({
            message: "create new post"
        })
        
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.deletePostByTeacher = async (req, res) => {
    try {
        res.send({
            message: "only delete their post"
        })
        
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.deletePostByAdmin = async (req, res) => {
    try {
        res.send({
            message: "delete"
        })
        
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}





