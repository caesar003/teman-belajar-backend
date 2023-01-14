const bcrypt = require("bcrypt");
const { supabase } = require("../config");
class Question {
    constructor() {}
    add() {}
    getLatest() {}
    getByPopularity() {}
    getByTag(tag, res) {
        supabase
            .from("questions")
            .select()
            .ilike("tags", `%${tag}%`)
            .then((data) => {
                console.log(data);
                return res.json(data);
            })
            .catch((err) => {
                console.log(err);
                return res.status(500).json({ error: "Error occured!" });
            });
    }
    search(query, res) {
        supabase
            .from("questions")
            .select("*")
            .ilike("question", `%${query}%`)
            .then((data) => {
                console.log(data);
                return res.json(data);
            })
            .catch((err) => {
                console.log(err);
                return res.status(500).json({ error: "Error occured!" });
            });
    }
}
const question = new Question();

module.exports = { question };
