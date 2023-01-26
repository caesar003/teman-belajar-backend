require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");

const app = express();
const port = process.env.PORT || 3002;

const { answer, student, question, lesson } = require("./src/db");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.status(403).json({ error: "Access resticted!" });
});

// LESSONS
app.get("/api/lesson", (req, res) => lesson.getAll(res));

app.post("/api/lesson/add", (req, res) => lesson.add(req.body, res));

app.patch("/api/lesson/update", (req, res) => lesson.update(req.body, res));

// QUESTIONS
app.get("/api/question/id/:id", (req, res) => question.get(req.params, res));

app.post("/api/question/ask", (req, res) => question.ask(req.body, res));

app.delete("/api/question/delete", (req, res) =>
    question.remove(req.body, res)
);

app.patch("/api/question/update", (req, res) => question.update(req.body, res));

app.get("/api/question/latest", (req, res) => question.getLatest(res));

app.get("/api/question/popular", (req, res) => question.getPopular(res));

app.get("/api/question/tag/:tag", (req, res) =>
    question.getByTag(req.params, res)
);

app.get("/api/question/search/:query", (req, res) =>
    question.search(req.params, res)
);

app.patch("/api/question/vote", (req, res) => question.vote(req.body, res));

// ANSWERS

app.post("/api/answer/answer", (req, res) => answer.answer(req.body, res));

app.patch("/api/answer/update", (req, res) => answer.update(req.body, res));

app.delete("/api/answer/delete", (req, res) => answer.remove(req.body, res));

app.patch("/api/answer/vote", (req, res) => answer.vote(req.body, res));

// STUDENTS

app.get("/api/student/email/:email", (req, res) => student.getByEmail(req.params, res))

app.post("/api/student/signin", (req, res) => student.signin(req.body, res));

app.post("/api/student/register", (req, res) =>
    student.register(req.body, res)
);

app.get("/api/student/search/:name", (req, res) =>
    student.search(req.params, res)
);

app.listen(port, () => console.log(`App is running on port: ${port}`));
