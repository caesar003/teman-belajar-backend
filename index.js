require("dotenv").config();
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const { v4: uuid } = require("uuid");

const app = express();
const mongoUri = process.env.MONGO_URI;
const port = process.env.PORT || 3002;

const { userModel } = require("./src/models");

mongoose
    .set({ strictQuery: false })
    .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send("This is working");
});

app.post("/api/signin", (req, res) => {
    const { email, password } = req.body;

    userModel.findOne({ email }).exec((err, user) => {
        if (err) return res.json({ error: "Failed to login" }).status(500);
        if (!user) {
            return res
                .json({ error: "User with that email does not exists" })
                .status(404);
        }
        const isCorrectPassword = bcrypt.compareSync(password, user.hash);
        if (!isCorrectPassword) {
            return res.json({ error: "Invalid credentials" }).status(400);
        }
        return res.json(user);
    });
});

app.post("/api/register", (req, res) => {
    const { password, name, email, phone } = req.body;

    userModel.findOne({ email }, (err, user) => {
        if (err) return res.json({ error: "Error occured" }).status(500);
        if (user)
            return res.json({ error: "Email already exists!" }).status(400);

        const hash = bcrypt.hashSync(password, 10);

        userModel.create(
            { id: uuid(), name, email, phone, hash },
            (err, user) => {
                if (err)
                    return res.json({ error: "Error occured" }).status(500);
                return res.json(user);
            }
        );
    });
});

app.listen(port, () => console.log(`App is running on port: ${port}`));
