module.exports = (app) => {
    const problemController = require("../controllers/problem.controller")
    var router = require("express").Router()
    const auth = require("../middleware/auth")
    const authAdmin = require("../middleware/authAdmin")
    const authTeacher = require("../middleware/authTeacher")
    var path = require('path')
    const multer  = require('multer')
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './static/zipFiles')
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname.replace(".zip", "") + '-' + Date.now()  + path.extname(file.originalname))
      }
    })
    
    var upload = multer({ storage: storage })

    // Validate zip file
    router.post("/validate_zip", auth, upload.single('zipFile'), problemController.validateZip)

    //Find all
    router.get("/admin", auth, authAdmin, problemController.findAllByAdmin)
    router.get("/teacher", auth, authTeacher, problemController.findAllByTeacher)
    router.get("/user", problemController.findAllByUser)

    //Create
    router.post("/", auth, upload.single('testDataURL'), authTeacher, problemController.createProblem)

    //Find one
    router.get("/admin/:id", auth, authAdmin, problemController.findOneByAdmin)
    router.get("/teacher/:id", auth, authTeacher, problemController.findOneByTeacher)
    router.get("/user/:id", problemController.findOneByUser)

    //Update one
    router.patch("/admin/:id", auth, authAdmin, upload.single('testDataURL'),problemController.updateOneByAdmin)
    router.patch("/teacher/:id", auth, authTeacher,upload.single('testDataURL'), problemController.updateOneByTeacher)

    
    router.delete("/admin/:id", auth, authAdmin, problemController.deleteByAdmin)
    router.delete("/teacher/:id", auth, authTeacher, problemController.deleteByTeacher)

    app.use("/api/problem", router)
}