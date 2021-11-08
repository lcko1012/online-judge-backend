
const cloudinary = require('cloudinary')
const fs = require('fs')

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

exports.uploadImage = (req, res) => {
    try {
        console.log(req)
        const file = req.file
        cloudinary.v2.uploader.upload(file.path, {
            folder: 'avatar'
        }, async (err, result) => {
            if (err) throw err

            removeTmp(file.path)

            res.send({ url: result.secure_url })
        })

    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

const removeTmp = (path) => {
    fs.unlink(path, err => {
        if(err) throw err
    })
}