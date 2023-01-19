const { supabase } = require("../config");

class TagQuestion {
    async insert(tagId, questionId) {
        const { data } = await supabase.from("tag_question").insert({
            tag_id: tagId,
            question_id: questionId,
        });
        return;
    }
}

const tagQuestion = new TagQuestion();

module.exports = { tagQuestion };
