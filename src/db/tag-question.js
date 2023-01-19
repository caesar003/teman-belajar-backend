const { supabase } = require("../config");

class TagQuestion {
    async insert(tagId, questionId) {
        return await supabase.from("tag_question").insert({
            tag_id: tagId,
            question_id: questionId,
        });
    }
}

const tagQuestion = new TagQuestion();
module.exports = { tagQuestion };
