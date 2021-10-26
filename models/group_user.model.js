module.exports = (sequelize, Sequelize) => {

    const Group_User = sequelize.define("group_user", {
        type: {
            type: Sequelize.STRING,
            primaryKey: true
        }
    }, {
        timestams: false
    })

    return Group_User
}

