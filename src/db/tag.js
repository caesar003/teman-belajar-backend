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

}

const tag = new Tag();
module.exports = { tag };
