const db = require("../models")
const Post = db.post
const Op = db.Sequelize.Op

exports.findAllByAdmin = async (req, res) => {
    try {
        const posts = await Post.findAll()
        res.send(posts)
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.findAllByTeacher = async (req, res) => {
    try {
        const posts = await Post.findAll({
            where: {
                [Op.or]: [
                    {visibleMode: "public"},
                    {author: req.user.username}
                ]
            }
        })

        res.send(posts)
        
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.findAllByUser = async (req, res) => {
    try {
        //get 20 posts recently
        const posts = await Post.findAll({
            where: {
                visibleMode: "public"
            },
            limit: 20,
            order: [
                ['createdAt', 'DESC']
            ]
        })

        res.send(posts)
        
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}


exports.findOneByAdmin = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id)
        
        res.send(post)
        
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.findOneByTeacher = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id)
        
        if(post.visibleMode !== "public" && post.author !== req.user.username){
            return res.status(400).send({ message: "Do not have permission" })
        }

        res.send(post)
        
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}


exports.findOneByUser = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id)
        
        if(post.visibleMode !== "public"){
            return res.status(400).send({ message: "Do not have permission" })
        }

        res.send(post)
        
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}


exports.updateOneByAdmin = async (req, res) => {
    try {
        const {title, content, visibleMode} = req.body

        if(!title || !content || !visibleMode) {
            return res.status(400).send({ message: "Please fill in all fields" })
        }

        console.log(title)
        
        await Post.update({
            title,
            content,
            visibleMode
        },
        {
            where: {
                id: req.params.id
            }
        })
        
        res.send({
            message: "Update success!"
        })
        
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}


exports.updateOneByTeacher = async (req, res) => {
    try {
        const {id} = req.params
        const {title, content, visibleMode} = req.body

        if(!title || !content || !visibleMode) {
            return res.status(400).send({ message: "Please fill in all fields" })
        }

        const post = await Post.findByPk(id)
        
        if(post.author !== req.user.username) {
            return res.status(400).send({ message: "Do not have permission" })
        }
        await Post.update({
            title,
            content,
            visibleMode
        },
        {
            where: {
                id: id
            }
        })

        res.send({
            message: "Update success!"
        })
        
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}


exports.createPost = async (req, res) => {
    try {
        const {title, content, visibleMode} = req.body
        console.log(content)
        if(!title || !content || !visibleMode) {
            return res.status(400).send({ message: "Please fill in all fields" })
        }

        await Post.create({
            title,
            content,
            visibleMode,
            author: req.user.username
        })

        res.send({message: "Create success!"})
        
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.deletePostByTeacher = async (req, res) => {
    try {
        const {id} = req.params
        const post = await Post.findByPk(id)
        
        if(post.author !== req.user.username) {
            return res.status(400).send({ message: "Do not have permission" })
        }

        await Post.destroy({
            where: {id}
        })
        res.send({
            message: "Delete success!"
        })
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.deletePostByAdmin = async (req, res) => {
    try {
        await Post.destroy({
            where: {
                id: req.params.id
            }
        })
        res.send({
            message: "Delete success!"
        })
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.searchPosts = async (req, res) => {
    try {
        if(!req.body.searchText) {
            return res.status(400).send({ message: "Please fill in field" })
        }

        const posts = await Post.findAll({
            where: {
                [Op.or]: [
                    {
                        author: {
                            [Op.iLike]: `%${req.body.searchText.toLowerCase()}%`
                        },
                       
                    },
                    {
                        content: {
                            [Op.iLike]: `%${req.body.searchText.toLowerCase()}%`
                        }
                    }
                ]
                
            }
        })
        res.send(posts)
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}





