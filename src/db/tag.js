const bcrypt = require("bcrypt");
const { supabase } = require("../config");

class Tag {
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

    deleteTagQuestion(questionId, res) {
        supabase
            .from("tag_question")
            .delete()
            .eq("question_id", questionId)
            .select("tag_id")
            .then(({ data }) => {
                data.forEach((item) => {
                    this.deleteTag(item.tag_id);
                });

                return supabase
                    .from("questions")
                    .delete()
                    .eq("id", questionId)
                    .then((data) => {
                        return res.json(data);
                    })
                    .catch((err) => {
                        return res
                            .status(500)
                            .json({ error: "Error occured!", err });
                    });
            })
            .catch((err) => {
                console.log(err);
            });
    }

    deleteTag(tagId) {
        supabase
            .from("tag_question")
            .select("*")
            .single()
            .eq("tag_id", tagId)
            .then((data) => {
                if (data.error) {
                    return supabase
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
                return;
            })
            .catch((err) => {
                console.log(err);
            });
    }
}

const tag = new Tag();
module.exports = { tag };
