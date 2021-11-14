const db = require("../models")
const Group = db.group
const User = db.user
const Op = db.Sequelize.Op

exports.findAll = async (req, res) => {
    try {
        const { name, username } = req.query
        var nameCondition = name ? { name: { [Op.iLike]: `%${name}%` } } : null
        var usernameCondition = username ? { username: { [Op.iLike]: `%${username}%` } } : null

        const groupList = await Group.findAll({
            attributes: [
                "id", "name",
            ],
            where: {
                [Op.and]: [
                    nameCondition,
                    {
                        delFlag: false
                    }
                ]
            },
            include: [
                {
                    model: User,
                    attributes: ['username'],
                    through: {
                        attributes: [],
                        where: {
                            type: 'Owner'
                        }
                    },
                    where: usernameCondition
                }
            ],
        })

        for ((i) in groupList) {
            const item = await Group.findOne({
                attributes: [
                    [db.Sequelize.fn('COUNT', db.Sequelize.col("users.username")), "userCount"]
                ],
                group: ['group.id'],
                includeIgnoreAttributes: false,
                include: [
                    {
                        model: User,
                        attributes: ['username'],
                        through: {
                            attributes: [],
                            where: {
                                type: 'Owner'
                            }
                        },
                        required: false,
                    }
                ],
                where: {
                    id: groupList[i].dataValues.id
                }
            })
            groupList[i].dataValues.userCount = item.dataValues.userCount
        }

        res.send(groupList)
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.createGroup = async (req, res) => {
    try {
        const { name, description } = req.body
        if (!name) {
            return res.status(400).send({ message: "Please fill in all fields" })
        }

        const user = await User.findByPk(req.user.username)

        const newGroup = await Group.create({
            name,
            description
        })

        await user.addGroup(newGroup, { through: { type: 'Owner' } })

        res.send({ message: "Create success!" })

    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.findOne = async (req, res) => {
    try {
        const group = await Group.findOne(
            {
                where: {
                    id: req.params.id
                },
                include: [
                    {
                        model: User,
                        attributes: ['username'],
                        through: {
                            attributes: ['type'],
                            where: {
                                type: 'Owner'
                            }
                        }
                    }
                ],
            }
        )
        res.send(group)
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}


exports.updateOneByAdmin = async (req, res) => {
    try {
        const { id } = req.params
        const { name, description } = req.body

        if (!name) {
            return res.status(400).send({ message: "Please fill in name field" })
        }

        await Group.update({
            name,
            description
        },
            {
                where: {
                    id
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
        const { id } = req.params
        const { name, description } = req.body
        console.log(req.user)
        if (!name) {
            return res.status(400).send({ message: "Please fill in name field" })
        }

        const group = await Group.findOne(
            {
                where: { id },
                include: [{
                    model: User,
                    attributes: ['username'],
                    where: { username: req.user.username },
                    through: {
                        attributes: [],
                        where: {
                            type: 'Owner'
                        }
                    },
                }],
            }
        )

        if (!group) {
            return res.status(400).send({ message: "Do not have permission" })
        }

        if (group.users[0].username !== req.user.username) {
            return res.status(400).send({ message: "Do not have permission" })
        }

        await Group.update({
            name,
            description
        },
            {
                where: {
                    id
                }
            })

        res.send({
            message: "Update success!"
        })

    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.deleteGroupByAdmin = async (req, res) => {
    try {
        const { id } = req.params

        await Group.update({
            delFlag: true
            },
            {
                where: {
                    id
                }
            })

        res.send({
            message: "Delete success!"
        })
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.deleteGroupByTeacher = async (req, res) => {
    try {
        const { id } = req.params

        const group = await Group.findOne(
            {
                where: { 
                    id,
                    delFlag: false
                },
                include: [{
                    model: User,
                    attributes: ['username'],
                    where: { username: req.user.username },
                    through: {
                        attributes: [],
                        where: {
                            type: 'Owner'
                        }
                    },
                }],
            }
        )

        if (!group) {
            return res.status(400).send({ message: "Group does not exist" })
        }

        if (group.users[0].username !== req.user.username) {
            return res.status(400).send({ message: "Do not have permission" })
        }

        await Group.update({
            delFlag: true
        },
            {
                where: {
                    id
                }
            })


        res.send({
            message: "Delete success!"
        })
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}


exports.findAllUsersInGroup = async (req, res) => {
    try {
        const userList = await Group.findOne({
            where: {
                id: req.params.id
            },
            attributes: [],
            include: [
                {
                    model: User,
                    attributes: ['username'],
                    through: {
                        attributes: ['type', 'createdAt'],
                    }
                }
            ],
        })
        res.send(userList)
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

exports.addUserToGroupByAdmin = async (req, res) => {
    try {
        const {username, groupId} = req.body

        const user = await User.findByPk(username)

        if(!user) return res.status(400).send({ message: "Student does not exist" })
        
        const group = await Group.findByPk(groupId)

        if(!group) return res.status(400).send({ message: "Group does not exist" })

        const userList = await Group.findOne({
            where: {
                id: groupId
            },
            attributes: [],
            include: [
                {
                    model: User,
                    attributes: ['username'],
                    where: {
                        username
                    }
                }
            ],
        })

        if(userList) return res.status(400).send({ message: "Student already exist in the group" })

        await group.addUser(user, { through: { type: 'Member' } })

        res.send({ message: "Add student success!" })

    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}