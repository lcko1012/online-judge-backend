module.exports = (sequelize, Sequelize) => {
    const roleType = require("../utils/roleType")

    const User = sequelize.define("user", {
        username: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        firstName: {
            type: Sequelize.STRING
        },
        lastName: {
            type: Sequelize.STRING
        },
        role: {
            type: Sequelize.STRING,
            defaultValue: roleType.REGULAR_USER
        },
        //Kiem tra tai khoan co bi khoa hay khong
        isActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        avatarUrl: {
            type: Sequelize.STRING,
            defaultValue: "https://res.cloudinary.com/dgp6k8yir/image/upload/v1634363145/avatar/t0attjkzsrf7uod8x06i.png"
        }
    })

    User.associate = db => {
        User.hasMany(db.post, {
            as: "post"
        })
    }

    return User
}

