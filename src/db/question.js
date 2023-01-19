const bcrypt = require("bcrypt");
const { supabase } = require("../config");

const { tag: Tag } = require("./tag");
const { tagQuestion } = require("./tagQuestion");
class Question {
    constructor() {}

    async ask(formData, res) {
        /**
         * 1. insert question
         * 2. insert tags (if don't exist yet)
         * 3. insert tag_question relation
         */
        const { text, studentId, tags: formTags } = formData;
        const tags = JSON.parse(formTags);
        const { data } = await supabase
            .from("questions")
            .insert({ text: text, student_id: studentId })
            .select("*")
            .single();

        /**
         * grab question_id, along with tags pass it to tag.handle() method
         */

        tags.forEach((tag) => Tag.handle(tag, data.id, tagQuestion.insert));
        return res.json(data);
    }

    delete(formData, res) {
        /**
         * 1. delete tag_question,
         * 2. delete tag (if necessary)
         * 3. delete answer (if exists)
         * 4. delete question
         */
        const { id } = formData;
        return Tag.deleteTagQuestion(id, res);
    }
    _delete(id) {
        /**
         * private method to delete question row
         */
        supabase
            .from("questions")
            .delete()
            .eq("id", id)
            .then((data) => {
                console.log(data);
            })
            .catch((err) => {
                console.log(err);
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

    getSingle(id, res) {
        supabase
            .from("questions")
            .select(`*, tags(*), answers(*)`)
            .eq("id", id)
            .single()
            .then((data) => {
                console.log(data);
                return res.json(data);
            })
            .catch((err) => {
                console.log(err);
                return res.status(500).json({ error: "Error occured", err });
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

    update(formData, res) {
        const { text, id, tags: formTags } = formData;
        const tags = JSON.parse(formTags);
        // update the question fields,
        supabase
            .from("questions")
            .update({ text: text })
            .eq("id", id)
            .select("*")
            .then((data) => {
                console.log(data);
                /**
                 * TODO: something about the tags,
                 * ?
                 */

                return res.json(data);
            })
            .catch((err) => {
                console.log(err);
                return res.status(500).json({ error: "Error occured!", err });
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
