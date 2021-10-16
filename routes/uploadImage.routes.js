module.exports = (app) => {
    var router = require("express").Router()
    const uploadImageController = require("../controllers/uploadImage.controller")
    const uploadImage = require("../middleware/uploadImage")
    const auth = require("../middleware/auth")

    router.post("/upload_image", auth , uploadImage, uploadImageController.uploadImage)

    app.use("/api", router)
}