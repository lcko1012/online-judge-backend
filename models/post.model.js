module.exports = (sequelize, Sequelize) => {

    const Post = sequelize.define("post", {
        title: {
            type: Sequelize.STRING,
            allowNull: false
        },
        content: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        visibleMode: {
            type: Sequelize.STRING,
            allowNull: false
        }
    })

    Post.associate = db => {
        Post.belongsTo(db.user, {
            foreignKey: "author",
            targetKey: "username"
        })
    }

    return Post
}

