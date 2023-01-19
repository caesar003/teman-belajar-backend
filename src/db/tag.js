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

    async getTagIds(tags) {
        const ids = [];
        /**
         * check for every items in the array, grab the id using _getId()
         * method if it exists, or insert it and again grab the id using the
         * _insert method
         */
        tags.forEach((tag) => {
            const id = this._getId(tag);

            ids.push(id);
        });
        console.log(ids);
    }

    async _insert(tag) {
        const { data } = await supabase
            .from("tags")
            .insert({ name: tag })
            .select("id")
            .single();

        return data.id;
    }

    async _getId(tag) {
        const { data } = await supabase
            .from("tags")
            .select("id")
            .eq("name", tag)
            .single();

        if (!data) return await this._insert(tag);
        return data.id;
    }

    _getName(id) {}

    async handle(tag, questionId, cb) {
        const tagId = await this._getId(tag);
        return cb(tagId, questionId);
    }
}

const tag = new Tag();
module.exports = { tag };
