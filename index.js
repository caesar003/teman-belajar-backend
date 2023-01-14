require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");

const app = express();
const port = process.env.PORT || 3002;

// const { student, lesson, question } = require("./src/db");
const { lesson, question, student } = require("./src/db");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.status(403).json({ error: "Access resticted!" });
});

app.get("/api/lesson-list", (req, res) => lesson.get(res));

app.get("/api/question/:query", (req, res) =>
    question.search(req.params.query, res)
);

app.get("/api/question-by-tag/:tag", (req, res) =>
    question.getByTag(req.params.tag, res)
);

app.post("/api/signin", (req, res) => student.signin(req.body, res));

app.post("/api/register", (req, res) => student.register(req.body, res));

app.post("/api/add-question", (req, res) => question.add(req.body, res));

app.listen(port, () => console.log(`App is running on port: ${port}`));
