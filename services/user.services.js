const db = require("../models")
const Op = db.Sequelize.Op
const User = db.user

const UserService = {
    findAllUsers: async (searchUsername, searchRole) => {
        var usernameCondition = searchUsername ? { username: { [Op.iLike]: `%${searchUsername}%` } } : null
        var roleCondition = searchRole ? { role: { [Op.iLike]: `%${searchRole}%` } } : null

        return await User.findAll({
            attributes: ["username", "role", "isActive", "createdAt"],
            where: {
                [Op.and]: [
                    usernameCondition,
                    roleCondition,
                ]
            }
        })
    }
}


module.exports = UserService