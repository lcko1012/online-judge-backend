module.exports = (app) => {
    const groupController = require("../controllers/group.controller")
    var router = require("express").Router()
    const auth = require("../middleware/auth")
    const authAdmin = require("../middleware/authAdmin")
    const authTeacher = require("../middleware/authTeacher")

    router.get("/", auth, authTeacher, groupController.findAll)
    router.post("/", auth, authTeacher, groupController.createGroup)

    router.get("/:id", auth, authTeacher, groupController.findOne)

    router.put("/admin/:id", auth, authAdmin, groupController.updateOneByAdmin)
    router.put("/teacher/:id", auth, authTeacher, groupController.updateOneByTeacher)
    router.delete("/admin/:id", auth, authAdmin, groupController.deleteGroupByAdmin)
    router.delete("/teacher/:id", auth, authTeacher, groupController.deleteGroupByTeacher)

    router.post("/search", auth, authTeacher, groupController.searchGroup)

    app.use("/api/group", router)
}