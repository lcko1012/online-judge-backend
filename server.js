require('dotenv').config()

const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const cookieParser = require("cookie-parser")
var path = require('path')

const app = express()

var corsOptions = {
    origin: "*"
}

app.use('/zip_files',express.static(__dirname));

app.use(cors(corsOptions))
app.use(cookieParser())

app.use(express.json())

app.use(express.urlencoded({extended: true}))

const db = require("./models")

// db.sequelize.sync({ force: true }).then(() => {
//     console.log("Drop and re-sync db.");
// });

db.sequelize.sync();

// app.get("/", (req, res) => {
//     res.json({message: "Hello world"})
// })

require("./routes/authentication.routes")(app)
require("./routes/user.routes")(app)
require("./routes/uploadImage.routes")(app)
require("./routes/post.routes")(app)
require("./routes/group.routes")(app)
require("./routes/problem.routes")(app)
require("./routes/problemTag.routes")(app)

// Define server configuration
// app.use(express.static(path.join(__dirname, "/online-judge-frontend/build")))
// app.use('/zip_files', express.static(__dirname));

// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, "/online-judge-frontend/build", 'index.html'))
// }) 

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})