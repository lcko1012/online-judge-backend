module.exports = (sequelize, Sequelize) => {

    const Problem = sequelize.define("problem", {
        title: {
            type: Sequelize.STRING,
            allowNull: false
        },
        statement: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        timeLimit: {
            type: Sequelize.INTEGER,
            //s
            defaultValue: 1
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
            defaultValue: 'public'
        },
        difficulty: {
            type: Sequelize.STRING
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
        }),

        Problem.hasMany(db.submission, {
            foreignKey: "problemId"
        })
    }

    return Problem
}

