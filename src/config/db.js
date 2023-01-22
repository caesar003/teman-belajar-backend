require("dotenv").config();
const postgres = require("postgres");

const URL = process.env.POSTGREURI;
const db = postgres(URL, { ssl: "require" });

module.exports = {db};