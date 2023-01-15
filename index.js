require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");

const app = express();
const port = process.env.PORT || 3002;

const { lesson, question, student, answer, tag } = require("./src/db");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.status(403).json({ error: "Access resticted!" });
});

// QUESTIONS
app.post("/api/ask", (req, res) => question.ask(req.body, res));

app.post("/api/delete-question", (req, res) => question.delete(req.body, res));

app.get("/api/latest", (req, res) => question.getLatest(res));

app.get("/api/popular", (req, res) => question.getByPopularity(res));

app.get("/api/tag/:tag", (req, res) => question.getByTag(req.params.tag, res));

app.get("/api/search-question/:query", (req, res) =>
    question.search(req.params.query, res)
);

app.post("/api/vote-question", (req, res) => question(req.body, res));

// ANSWERS

app.post("/api/answer", (req, res) => answer.answer(req.body, res));

app.post("/api/update-answer", (req, res) => answer.update(req.body, res));

app.post("/api/delete-answer", (req, res) => answer.delete(req.body, res));

app.post("/api/vote-answer", (req, res) => answer.vote(req.params, res));

// STUDENTS

app.post("/api/signin", (req, res) => student.signin(req.body, res));

app.post("/api/register", (req, res) => student.register(req.body, res));

app.get("/api/search-student/:name", (req, res) =>
    student.search(req.params.name, res)
);

app.listen(port, () => console.log(`App is running on port: ${port}`));
