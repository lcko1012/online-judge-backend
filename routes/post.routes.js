module.exports = (app) => {
    const postController = require("../controllers/post.controller")
    var router = require("express").Router()
    const auth = require("../middleware/auth")
    const authAdmin = require("../middleware/authAdmin")
    const authTeacher = require("../middleware/authTeacher")

    //Get current user
    router.post("/", auth, authTeacher, postController.createPost)

    router.get("/admin", auth, authAdmin , postController.findAllByAdmin)
    router.get("/admin/:id", auth, authAdmin, postController.findOneByAdmin)
    router.put("/admin/:id", auth, authAdmin, postController.updateOneByAdmin)
    router.delete("/admin/:id", auth, authAdmin, postController.deletePostByAdmin)

    router.get("/teacher", auth, authTeacher , postController.findAllByTeacher)
    router.get("/teacher/:id", auth, authTeacher, postController.findOneByTeacher)
    router.put("/teacher/:id", auth, authTeacher, postController.updateOneByTeacher)
    router.delete("/teacher/:id", auth, authTeacher, postController.deletePostByTeacher)


    router.get("/user", auth, postController.findAllByUser)
    router.get("/user/:id", auth, postController.findOneByUser)


    app.use("/api/post", router)
}