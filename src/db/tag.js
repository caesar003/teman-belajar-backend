const bcrypt = require("bcrypt");
const { supabase } = require("../config");

class Tag {
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

    tagQuestion(tagId, questionId) {
        supabase
            .from("tag_question")
            .insert({
                tag_id: tagId,
                question_id: questionId,
            })
            .then((data) => {
                console.log(data);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    add(tag) {
        supabase
            .from("tags")
            .insert(tag)
            .then((data) => {
                console.log(data);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    getTagId(tag) {
        supabase
            .from("tags")
            .select("id")
            .eq("tag", tag)
            .then((data) => {
                console.log(data);

                // returns the id if it does exist

                // insert it if it doesn't
            })
            .catch((err) => {
                console.log(err);
            });
    }
}

const tag = new Tag();
module.exports = { tag };
