require('dotenv').config()

const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")

const app = express()

var corsOptions = {
    origin: "http://localhost:3000"
}

app.use(cors(corsOptions))

app.use(express.json())

app.use(express.urlencoded({extended: true}))

const db = require("./models")

db.sequelize.sync({ force: true }).then(() => {
    console.log("Drop and re-sync db.");
});

// db.sequelize.sync();

app.get("/", (req, res) => {
    res.json({message: "Hello world"})
})

require("./routes/authentication.routes")(app)
require("./routes/user.routes")(app)

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})