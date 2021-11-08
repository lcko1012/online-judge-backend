module.exports = (app) => {
    const problemTagController = require("../controllers/problemTag.controller")
    var router = require("express").Router()
    const auth = require("../middleware/auth")
    const authAdmin = require("../middleware/authAdmin")
    const authTeacher = require("../middleware/authTeacher")

    // Find all tags
    router.get("/" , problemTagController.findAll)

    // Create a new tag
    router.post("/", problemTagController.createTag)

    app.use("/api/tag", router)
}