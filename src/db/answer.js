const { supabase } = require("../config");

class Answer {
    async answer(formData, res) {
        const { text, studentId, questionId } = formData;
        const { data } = await supabase
            .from("answers")
            .insert({
                question_id: questionId,
                text,
                student_id: studentId,
            })
            .select("*")
            .single();
        return res.json(data);
    }

    async remove(questionId) {
        const data = await supabase
            .from("answers")
            .delete("*")
            .eq("question_id", questionId);
        return data;
    }
}

const answer = new Answer();
module.exports = { answer };
