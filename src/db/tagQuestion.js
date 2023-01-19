const { supabase } = require("../config");

class TagQuestion {
    async delete(questionId, cb) {
        const { data } = await supabase
            .from("tag_question")
            .delete()
            .eq("question_id", questionId)
            .select("tag_id");

        return data.forEach((item) => this._stillExists(item.tag_id, cb));
    }

    async insert(tagId, questionId) {
        const { data } = await supabase.from("tag_question").insert({
            tag_id: tagId,
            question_id: questionId,
        });
        return;
    }

    async _stillExists(id, cb) {
        const { data } = await supabase
            .from("tag_question")
            .select("*")
            .single()
            .eq("tag_id", id);

        if (data) return;
        return cb(data.id);
    }
}

const tagQuestion = new TagQuestion();

module.exports = { tagQuestion };
