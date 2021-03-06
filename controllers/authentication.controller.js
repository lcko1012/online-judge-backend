const db = require("../models")
const User = db.user
const Op = db.Sequelize.Op
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const sendEmail = require("./sendMail")

const {CLIENT_URL} = process.env

exports.register = async (req, res) => {
    try {
        const { username, email, password, matchedPassword } = req.body
        if (!username || !email || !password || !matchedPassword) {
            return res.status(400).send({ 
                message: "Please fill in all fields" 
            })
        }

        if (!validateEmail(email)) {
            return res.status(400).send({
                message: "Invalid Email"
            })
        }

        if(password.length < 6 || password.length > 32) {
            return res.status(400).send({message: "Password is greater than 6 and less than 32 characters"})
        }

        if (password !== matchedPassword) {
            return res.status(400).send({
                message: "Passwords do not match"
            })
        }


        const checkUsername = await User.findByPk(username)
        if (checkUsername) return res.status(400).send({ message: "This username already exists" })

        const checkEmail = await User.findOne({ where: { email: email }})
        if (checkEmail) return res.status(400).send({ message: "This email already exists" })


        const passwordHash = await bcrypt.hash(password, 12)

        const newUser = {
            username, email, password: passwordHash
        }

        const activationToken = createActivationToken(newUser)
        const url = `${CLIENT_URL}/user/activate/${activationToken}`

        sendEmail(email, url, "Verify your email address")

        await User.create(newUser)

        res.send({
            message: "Register Success! Please activate your email to start"
        })
    }
    catch (err) {
        return res.status(500).send({ message: err.message })
    }
}

exports.activateEmail = async (req, res) => {
    try {
        const { activationToken } = req.body
        const user = jwt.verify(activationToken, process.env.ACTIVATION_TOKEN_SECRET)

        const {username, email, password} = user
        const existedUser = await User.findOne({
            where: { username, email, password }
        })
        
        if(!existedUser) return res.status(400).send({ message: "This user does not exists" })

        await User.update({
            isEnable: true,
        }, {
            where: {username}
        })

        res.send({message: "Account has been activated"})

    } catch (err) {
        return res.status(500).send({ message: err.message })
    }
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

        if(user.isEnable === false) return res.status(400).send({
            message: "This account is not activated yet"
        })

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch) return res.status(400).send({
            message: "Invalid username or password"
        })

        const refreshToken = createRefreshToken({username: user.username})
        console.log(process.env.NODE_ENV === 'production')
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            path: '/api/auth/refresh_token',
            maxAge: 7*24*60*60*1000,
            secure: process.env.NODE_ENV === 'production',
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
        console.log(req.cookies)
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

exports.forgotPassword = async (req, res) => {
    try {
        const {email, username} = req.body
        if(!email || !username) return res.status(400).send({message: "Please fill in all fields"})
        const user = await User.findOne({
            where: {email, username}
        })

        if(!user) return res.status(400).send({message: "This user does not exist"})

        const access_token = createAccessToken({username: user.username})
        const url = `${CLIENT_URL}/reset_password/${access_token}`

        sendEmail(email, url, "Reset your password")
        res.send({message: "Re-send the password, please check your email"})

    } catch (err) {
        return res.status(500).send({message: err.message}) 

    }
}

exports.resetPassword = async (req, res) => {
    try {
        const {password, matchedPassword} = req.body
        if(!password && !matchedPassword) {
            return res.status(400).send({message: "Please fill in all fields"})
        }

        if(password.length < 6 || password.length > 32) {
            return res.status(400).send({message: "Password is greater than 6 and less than 32 characters"})
        }

        if (password !== matchedPassword) {
            return res.status(400).send({
                message: "Passwords do not match"
            })
        }

        const passwordHash = await bcrypt.hash(password, 12)

        await User.update({
            password: passwordHash}, {
            where: {username: req.user.username}
        })

        res.send({message: "Password successfully changed"})
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

const createActivationToken = (payload) => {
    return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, { expiresIn: '365d'})
}

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}