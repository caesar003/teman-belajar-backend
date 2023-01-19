const { supabase } = require("../config");

class TagQuestion {
    async get(questionId) {
        console.log(questionId);
        const { data } = await supabase
            .from("tag_question")
            .select(`tags(*)`)
            .eq("question_id", questionId);

        return data.map((item) => ({ id: item.tags.id, name: item.tags.name }));
    }
    async insert(tagId, questionId) {
        return await supabase.from("tag_question").insert({
            tag_id: tagId,
            question_id: questionId,
        });
    }
}

const tagQuestion = new TagQuestion();
module.exports = { tagQuestion };
