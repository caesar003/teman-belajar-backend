require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");

const app = express();
const port = process.env.PORT || 3002;

const { answer, student, question } = require("./src/db");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.status(403).json({ error: "Access resticted!" });
});

// QUESTIONS
app.get("/api/get-question/:id", (req, res) => question.get(req.params, res));

app.post("/api/ask", (req, res) => question.ask(req.body, res));

app.post("/api/delete-question", (req, res) => question.remove(req.body, res));

app.post("/api/update-question", (req, res) => question.update(req.body, res));

app.get("/api/latest", (req, res) => question.getLatest(res));

app.get("/api/popular", (req, res) => question.getByPopularity(res));

app.get("/api/tag/:tag", (req, res) => question.getByTag(req.params.tag, res));

app.get("/api/search-question/:query", (req, res) =>
    question.search(req.params.query, res)
);

app.post("/api/vote-question", (req, res) => question.vote(req.body, res));

// ANSWERS

app.post("/api/answer", (req, res) => answer.answer(req.body, res));

app.post("/api/update-answer", (req, res) => answer.update(req.body, res));

app.post("/api/delete-answer", (req, res) => answer.remove(req.body, res));

app.post("/api/vote-answer", (req, res) => answer.vote(req.params, res));

// STUDENTS

app.post("/api/signin", (req, res) => student.signin(req.body, res));

app.post("/api/register", (req, res) => student.register(req.body, res));

app.get("/api/search-student/:name", (req, res) =>
    student.search(req.params.name, res)
);

// Testings

app.post("/api/add-tag", (req, res) => tag.add(req.body.tag, res));

app.listen(port, () => console.log(`App is running on port: ${port}`));
