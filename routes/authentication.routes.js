module.exports = (app) => {
    const authController = require("../controllers/authentication.controller")
    var router = require("express").Router()

    router.post("/login", authController.login)
    router.post("/register", authController.register)
    router.get("/refresh_token", authController.getAccessToken)
    router.get("/logout", authController.logout)
    router.post("/activation", authController.activateEmail)
    
    app.use("/api/auth", router)
}