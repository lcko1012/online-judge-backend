module.exports = (app) => {
    var router = require("express").Router()
    const uploadImageController = require("../controllers/uploadImage.controller")
    const uploadImage = require("../middleware/uploadImage")
    const auth = require("../middleware/auth")

    const multer  = require('multer')
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './static/avatar')
        },
        filename: function (req, file, cb) {
            cb(null, file.fieldname + '-' + Date.now())
      }
    })
    var upload = multer({ storage: storage })

    router.post("/upload_image", auth , upload.single('file'), uploadImage, uploadImageController.uploadImage)

    app.use("/api", router)
}