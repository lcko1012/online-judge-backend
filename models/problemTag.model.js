module.exports = (sequelize, Sequelize) => {

    const ProblemTag = sequelize.define("problemTag", {
        tagName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.STRING,
        },
        delFlag: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        }
    })

    ProblemTag.associate = db => {
        ProblemTag.belongsToMany(db.problem, {
            through: "problemTag_problem",
            foreignKey: "tagId",
        })
    }

    return ProblemTag
}

