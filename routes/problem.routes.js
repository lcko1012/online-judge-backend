module.exports = (app) => {
    const problemController = require("../controllers/problem.controller")
    var router = require("express").Router()
    const auth = require("../middleware/auth")
    const authAdmin = require("../middleware/authAdmin")
    const authTeacher = require("../middleware/authTeacher")

    //Find all
    router.get("/admin", auth, authAdmin, problemController.findAllByAdmin)
    router.get("/teacher", auth, authTeacher, problemController.findAllByTeacher)

    //Create
    router.post("/", auth, authTeacher, problemController.createProblem)

    //Find one
    router.get("/admin/:id", auth, authAdmin, problemController.findOneByAdmin)
    router.get("/teacher/:id", auth, authTeacher, problemController.findOneByTeacher)

    //Update one
    router.put("/admin/:id", auth, authAdmin, problemController.updateOneByAdmin)
    router.put("/teacher/:id", auth, authTeacher, problemController.updateOneByTeacher)

    
    router.delete("/admin/:id", auth, authAdmin, problemController.deleteByAdmin)
    router.delete("/teacher/:id", auth, authTeacher, problemController.deleteByTeacher)

    app.use("/api/problem", router)
}