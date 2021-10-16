module.exports = (app) => {
    const userController = require("../controllers/user.controller")
    var router = require("express").Router()
    const auth = require("../middleware/auth")

    //Get current user
    router.get("/whoami", auth ,userController.getCurrentUser)

    router.put("/update/password", auth, userController.updatePassword)

    router.put("/update/information", auth, userController.updateInformation)

    router.put("/update/avatar", auth, userController.updateAvatar)

    app.use("/api/user", router)
}