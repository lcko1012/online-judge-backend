module.exports = (sequelize, Sequelize) => {

    const Group_User = sequelize.define("group_user", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        type: {
            type: Sequelize.STRING,
        }
    }, {
        timestams: false
    })

    return Group_User
}

