const dbConfig = require("../config/db.config")

const Sequelize = require("sequelize")

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    operatorsAliases: false,

    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
})

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

db.user = require("./user.model")(sequelize, Sequelize)
db.post = require("./post.model")(sequelize, Sequelize)
db.group_user = require("./group_user.model")(sequelize, Sequelize)
db.group = require("./group.model")(sequelize, Sequelize)
db.problem = require("./problem.model")(sequelize, Sequelize)
db.problemTag = require("./problemTag.model")(sequelize, Sequelize)

Object.keys(db).forEach(key => {
    if('associate' in db[key]) {
        db[key].associate(db)
    }
})


module.exports = db


