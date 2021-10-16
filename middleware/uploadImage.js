const fs = require("fs")

module.exports = async function(req, res, next){
    try {
        console.log(req.files)
        if(!req.files || Object.keys(req.files).length === 0){
            return res.status(400).json({message: "No files were uploaded."})
        }
        
        const file = req.files.file
        console.log(file)
        if(file.size > 1024*1024){
            removeTmp(file.tempFilePath)
            return res.status(400).json({message: "Size too large"})
        } // 1mb

        if(file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png'){
            removeTmp(file.tempFilePath)
            return res.status(400).json({message: "File format is incorrect"})
        }
        next()
        
    } catch (err) {
        return res.status(500).json({message: err.message})
    }
}

const removeTmp = (path) => {
    fs.unlink(path, err => {
        if(err) throw err
    })
}