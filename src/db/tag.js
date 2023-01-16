const bcrypt = require("bcrypt");
const { supabase } = require("../config");

class Tag {
    add(tag, res) {
        supabase
            .from("tags")
            .insert({ name: tag })
            .select("*")
            .single()
            .then(({ data }) => {
                const { id } = data;
                return id;
            })
            .catch((err) => {
                console.log(err);
                return res.status(500).json({ error: "Error occured!" });
            });
    }
    delete(tagId) {
        supabase
            .from("tags")
            .delete()
            .eq("id", tagId)
            .then((data) => {
                console.log(data);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    getTagName(id) {
        supabase
            .from("tags")
            .select("tag")
            .eq("id", id)
            .then((data) => {
                console.log(data);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    insertTag(tag, questionId) {
        supabase
            .from("tags")
            .insert({ name: tag })
            .select("id")
            .single()
            .then(({ data }) => {
                return this.insertTagQuestion(data.id, questionId);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    insertTagQuestion(tagId, questionId) {
        supabase
            .from("tag_question")
            .insert({
                tag_id: tagId,
                question_id: questionId,
            })
            .then((data) => {
                return data;
            })
            .catch((err) => {
                console.log(err);
            });
    }

    tagQuestion(tag, questionId) {
        supabase
            .from("tags")
            .select("id")
            .eq("name", tag)
            .single()
            .then((data) => {
                if (data.error) {
                    return this.insertTag(tag, questionId);
                }
                return this.insertTagQuestion(data.data.id, questionId);
            })
            .catch((err) => {
                return err;
            });
    }

    getTagId(tag) {
        supabase
            .from("tags")
            .select("id")
            .eq("name", tag)
            .single()
            .then(({ data: { id } }) => {
                return id;
            })
            .catch((err) => {
                console.log(err);
            });
    }
}

const tag = new Tag();
module.exports = { tag };
