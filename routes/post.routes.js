module.exports = (app) => {
    const postController = require("../controllers/post.controller")
    var router = require("express").Router()
    const auth = require("../middleware/auth")
    const authAdmin = require("../middleware/authAdmin")
    const authTeacher = require("../middleware/authTeacher")

    //Create new post by admin and teacher
    router.post("/", auth, authTeacher, postController.createPost)
    router.post("/search_title", auth, authTeacher, postController.searchPosts)

    router.get("/admin", auth, authAdmin , postController.findAllByAdmin)
    router.get("/admin/:id", auth, authAdmin, postController.findOneByAdmin)
    router.put("/admin/:id", auth, authAdmin, postController.updateOneByAdmin)
    router.delete("/admin/:id", auth, authAdmin, postController.deletePostByAdmin)

    router.get("/teacher", auth, authTeacher , postController.findAllByTeacher)
    router.get("/teacher/:id", auth, authTeacher, postController.findOneByTeacher)
    router.put("/teacher/:id", auth, authTeacher, postController.updateOneByTeacher)
    router.delete("/teacher/:id", auth, authTeacher, postController.deletePostByTeacher)


    router.get("/user", postController.findAllByUser)
    router.get("/user/:id", postController.findOneByUser)


    app.use("/api/post", router)
}