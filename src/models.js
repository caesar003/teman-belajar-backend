"use strict";

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    id: String,
    name: String,
    email: { type: String, unique: true },
    phone: String,
    hash: String,
});

const userModel = new mongoose.model("User", userSchema);

module.exports = { userModel };
