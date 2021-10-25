
module.exports = (app) => {
    const authController = require("../controllers/authentication.controller")
    var router = require("express").Router()
    const auth = require("../middleware/auth")

    router.post("/login", authController.login)
    router.post("/register", authController.register)
    router.get("/refresh_token", authController.getAccessToken)
    router.get("/logout", authController.logout)
    router.post("/activation", authController.activateEmail)
    router.post("/forgot", authController.forgotPassword)
    router.post("/reset", auth , authController.resetPassword)
    
    app.use("/api/auth", router)
}