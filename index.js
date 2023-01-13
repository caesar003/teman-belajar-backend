require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");

const app = express();
const port = process.env.PORT || 3002;

const { signin, register } = require("./src/db");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send("This is working");
});

app.post("/api/signin", (req, res) => signin(req.body, res));

app.post("/api/register", (req, res) => register(req.body, res));

app.listen(port, () => console.log(`App is running on port: ${port}`));
