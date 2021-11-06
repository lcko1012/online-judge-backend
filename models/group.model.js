module.exports = (sequelize, Sequelize) => {

    const Group = sequelize.define("group", {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.TEXT
        },
        
        //false: haven't delete
        //true: deleted
        delFlag: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        }
    })

    Group.associate = db => {
        Group.belongsToMany(db.user, {
            through: db.group_user,
            foreignKey: "groupId",
        })
    }

    return Group
}

