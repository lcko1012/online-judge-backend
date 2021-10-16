const jwt = require('jsonwebtoken')

const auth = (req, res, next) => {
    try {
        const token = req.header("Authorization")
        if(!token) return res.status(400).send({message: "Invalid Authentication"})

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if(err) return res.status(400).send({message: err.message})

            req.user = user

            next()
        })
    }catch(err){
        return res.status(500).send({message: "Invailid Authentication"})
    }
}

module.exports = auth