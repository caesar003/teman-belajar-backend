const bcrypt = require("bcrypt");
const { supabase } = require("../config");

const { tag: Tag } = require("./tag");
class Question {
    constructor() {}

    ask(formData, res) {
        const { question, studentId, tags } = formData;

        supabase
            .from("questions")
            .insert({
                question,
                student_id: studentId,
            })
            .select("*")
            .then((data) => {
                console.log(data);
                // captute question id, and use it for tag
                // do something about tags if there is any

                // get tag id, insert it to tag_question
                tags.forEach((tag) => {
                    Tag.tagQuestion(tag);
                });

                return res.json(data);
            })
            .catch((err) => {
                return res.status(500).json({ error: "Error occured" });
            });
    }

    delete(formData, res) {
        const { id } = formData;
        supabase
            .from("questions")
            .delete()
            .eq("id", id)
            .then((data) => {
                console.log(data);
            })
            .catch((err) => {
                console.log(err);
                return res.status(500).json({ error: "Error occured" });
            });
    }

    getLatest(res) {
        supabase
            .from("questions")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(20)
            .then((data) => {
                console.log(data);
            })
            .catch((err) => {
                console.log(err);
                return res.status(500).json({ error: "Error occured" });
            });
    }

    getByPopularity(res) {
        supabase
            .from("questions")
            .select("*")
            .order("vote", { ascending: false })
            .limit(20)
            .then((data) => {
                console.log(data);
            })
            .catch((err) => {
                console.log(err);
                return res.status(500).json({ error: "Error occured" });
            });
    }

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

    vote(vote, id) {
        supabase
            .from("questions")
            .select("vote")
            .eq("id", id)
            .then((data) => {
                console.log(data);
                supabase
                    .from("questions")
                    .update({
                        /* add something here */
                    })
                    .then((data) => {
                        console.log(data);
                    })
                    .catch((err) => {
                        console.log(err);
                        return res.status(500).json({ error: "Error occured" });
                    });
            })
            .catch((err) => {
                console.log(err);
                return res.status(500).json({ error: "Error occured" });
            });
    }
}
const question = new Question();

module.exports = { question };
