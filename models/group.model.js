module.exports = (sequelize, Sequelize) => {

    const Group = sequelize.define("group", {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.TEXT
        }
    })

    Group.associate = db => {
        Group.belongsToMany(db.user, {
            through: db.group_user,
            foreignKey: "group_id",
        })
    }

    return Group
}

