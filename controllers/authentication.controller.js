const db = require("../models")
const User = db.user
const Op = db.Sequelize.Op
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

exports.register = (req, res) => {

}

exports.login = async (req, res) => {
    try {
        const {username, password} = req.body
        if(!username || !password) {
            return res.status(400).send({message: "Please fill in all fields."})
        }

        const user = await User.findByPk(username)
        if(!user) return res.status(400).send({
            message: "Invalid username or password"
        })

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch) return res.status(400).send({
            message: "Invalid username or password"
        })

        const refreshToken = createRefreshToken({username: user.username})

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            path: '/api/auth/refresh_token',
            maxAge: 7*24*60*60*1000
        })

        const accessToken = createAccessToken({username: user.username})
        res.send({accessToken})
    }
    catch(err) {
        return res.status(500).send({message: err.message})
    }
}

exports.getAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken
        if(!refreshToken) return res.status(400).send({
            message: "Please login now"
        })

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if(err) return res.status(400).json({message: "Please login now"})
            const accessToken = createAccessToken({username: user.username})
            res.send({accessToken})
        })
    } catch (err) {
        return res.status(500).send({message: err.message}) 
    }
}

exports.logout = async (req, res) => {
    try {
        res.clearCookie('refreshToken', {path: '/api/auth/refresh_token'})
        return res.send({message: "Logged out"})
    } catch (err) {
        return res.status(500).send({message: err.message}) 

    }
}


const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'})
}

const createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'})
}