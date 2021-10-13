module.exports = (app) => {
    const userController = require("../controllers/user.controller")
    var router = require("express").Router()

    //Get current user
    router.get("/whoami", userController.getCurrentUser)

    router.put("/update/password", userController.updatePassword)

    router.put("/update/information", userController.updateInformation)

    app.use("/api/user", router)
}