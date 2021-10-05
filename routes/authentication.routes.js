module.exports = (app) => {
    const authController = require("../controllers/authentication.controller")
    var router = require("express").Router()

    router.post("/login", authController.login)
    router.post("/register", authController.register)
    
    app.use("/api/auth", router)
}