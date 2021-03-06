const db = require("../models")
const User = db.user
const roleType = require("../utils/roleType")

const authAdmin = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.username)
        if(user.role === roleType.ADMIN) {
            next()
        }
        else {
            return res.status(403).send({ message: "Admin resources access denied." })
        }
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

module.exports = authAdmin