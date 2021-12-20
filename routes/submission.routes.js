module.exports = (app) => {
    const submissionController = require("../controllers/submission.controller")
    var router = require("express").Router()
    const auth = require("../middleware/auth")
    const authAdmin = require("../middleware/authAdmin")
    const authTeacher = require("../middleware/authTeacher")

    router.get("/admin/:id", auth, authAdmin, submissionController.findOneByAdmin)
    router.get("/teacher/:id", auth, authTeacher, submissionController.findOneByTeacher)
    router.get("/user/:id", submissionController.findOneByUser)
    router.post("/:id", auth, submissionController.submitCode)
    router.get("/user", submissionController.findAllByUser)
    router.get("/admin", submissionController.findAllByAdmin)
    router.put("/update_verdict/:id", submissionController.updateVerdict)

    router.delete("/admin/:id", auth, authAdmin, submissionController.deleteOneByAdmin)
    
    app.use("/api/submission", router)
}