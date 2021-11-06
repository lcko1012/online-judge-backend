module.exports = (sequelize, Sequelize) => {

    const Problem = sequelize.define("problem", {
        title: {
            type: Sequelize.STRING,
            allowNull: false
        },
        statement: {
            type: Sequelize.STRING,
            allowNull: false
        },
        timeLimit: {
            type: Sequelize.INTEGER,
            //ms
            defaultValue: 1000
        },
        memoryLimit: {
            type: Sequelize.INTEGER,
            //mb
            defaultValue:  256
        },
        testDataURL: {
            type: Sequelize.STRING
        },
        visibleMode: {
            type: Sequelize.STRING,
        },
        totalAttempt: {
            type: Sequelize.INTEGER
        },
        correctAttempt: {
            type: Sequelize.INTEGER
        },
        difficulty: {
            type: Sequelize.INTEGER
        },
        delFlag: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        }
    })

    Problem.associate = db => {
        Problem.belongsTo(db.user, {
            foreignKey: "author",
            targetKey: "username"
        }),

        Problem.belongsToMany(db.problemTag, {
            through: "problemTag_problem",
            foreignKey: "problemId",
        })
    }

    return Problem
}

