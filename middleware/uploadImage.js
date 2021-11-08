const fs = require("fs")

module.exports = async function(req, res, next){
    try {
        if(!req.file || Object.keys(req.file).length === 0){
            return res.status(400).json({message: "No files were uploaded."})
        }
        
        const file = req.file
        if(file.size > 1024*1024*2){
            removeTmp(file.path)
            return res.status(400).json({message: "Size too large"})
        } // 2mb

        if(file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png'){
            removeTmp(file.path)
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