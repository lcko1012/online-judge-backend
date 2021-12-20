module.exports = (sequelize, Sequelize) => {

    const Submission = sequelize.define("submission", {
        verdict: {
            type: Sequelize.STRING,
            // allowNull: false
        },
        output: {
            type: Sequelize.ARRAY(Sequelize.JSONB),
        },
        tokens: {
            // type: Sequelize.ARRAY(Sequelize.JSONB)
            type: Sequelize.STRING,
        },
        language: {
            type: Sequelize.STRING
        },
        source: {
            type: Sequelize.TEXT
        },
        delFlag: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        }
    })

    Submission.associate = db => {
        Submission.belongsTo(db.user, {
            foreignKey: "author",
            targetKey: "username"
        }),

        Submission.belongsTo(db.problem, {
            foreignKey: "problemId"
        })
    }

    return Submission
}

