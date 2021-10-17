const db = require("../models")
const User = db.user
const Op = db.Sequelize.Op
const bcrypt = require('bcrypt')

exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.username, {
            attributes: {
                exclude: ['password', 'createdAt', 'updatedAt']
            }
        })

        res.send(user)
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.updatePassword = async (req, res) => {
    try {
        const {oldPassword, password, matchedPassword} = req.body
        if(!oldPassword || !password || !matchedPassword) return res.status(400).send({
            message : "Please fill in all fields"
        })

        if(password.length < 6 || password.length > 32) return res.status(400).send({
            message: "Password is greater than 6 and less than 32 characters"
        })
        
        if(password !== matchedPassword) return res.status(400).send({
            message : "The password do not match"
        })

        //Check old password
        const user = await User.findByPk(req.user.username)
        const isMatch = await bcrypt.compare(oldPassword, user.password)

        if(!isMatch) return res.status(400).send({
            message: "The old password is incorrect"
        })

        const passwordHash = await bcrypt.hash(password, 12)
        console.log(req.user.username)
        await User.update({
            password: passwordHash}, {
            where: {username: req.user.username}
        })

        res.send({
            message: "Password successfully changed"
        })
        
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.updateInformation = async (req, res) => {
    try {
        const username = req.user.username
        const {email, firstName, lastName} = req.body
        if(!email) return res.status(400).send({
            message : "Please fill in email field"
        })

        //Check if email is exist
        const existedUser = await User.findAll({
            where: {
                email: email,
                username: {
                    [Op.ne]: username
                }
            }
        })

        if(existedUser.length !== 0)  return res.status(400).send({
            message : "Email already exists"
        })


        await User.update({
            email: email,
            firstName: firstName,
            lastName: lastName
        }, {
            where: {username: username}
        })

        res.send({
            message: "Update Successful"
        })
        
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.updateAvatar = async (req, res) => {
    try {
        const username = req.user.username
        const {avatarUrl} = req.body

        if(!avatarUrl) return res.status(400).send({
            message : "Please fill in avatar field"
        })

        await User.update({
            avatarUrl: avatarUrl,
        }, {
            where: {username: username}
        })

        res.send({
            message: "Update Successful"
        })
        
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}