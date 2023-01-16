const bcrypt = require("bcrypt");
const { supabase } = require("../config");

const { tag: Tag } = require("./tag");
class Question {
    constructor() {}

    ask(formData, res) {
        const { text, studentId, tags: formTags } = formData;

        const tags = JSON.parse(formTags);
        supabase
            .from("questions")
            .insert({
                text: text,
                student_id: studentId,
            })
            .select("*")
            .single()
            .then(({ data }) => {
                const { id: questionId } = data;
                tags.forEach((tag) => {
                    Tag.tagQuestion(tag, questionId);
                });
                return res.json(data);
            })
            .catch((err) => {
                return res.status(500).json({ error: "Error occured", err });
            });
    }

    delete(formData, res) {
        const { id } = formData;
        return Tag.deleteTagQuestion(id, res);
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

    vote(formData, res) {
        const { vote, id } = formData;
        supabase
            .from("questions")
            .select("vote")
            .single()
            .eq("id", id)
            .then(({ data }) => {
                supabase
                    .from("questions")
                    .update({
                        vote: data.vote + vote,
                    })
                    .eq("id", id)
                    .select()
                    .single()
                    .then((data) => {
                        return res.json(data);
                    })
                    .catch((err) => {
                        return res.status(500).json({ error: "Error occured" });
                    });
            })
            .catch((err) => {
                return res.status(500).json({ error: "Error occured" });
            });
    }
}
const question = new Question();

module.exports = { question };
