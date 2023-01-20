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

    async deleteByQuestion(questionId) {
        const data = await supabase
            .from("answers")
            .delete("*")
            .eq("question_id", questionId);
        return data;
    }

    async remove({ id }, res) {
        const data = await supabase.from("answers").delete().eq("id", id);

        return res.json(data);
    }

    async update(formData, res) {
        const { id, text } = formData;
        const { data } = await supabase
            .from("answers")
            .update({
                text: text,
            })
            .eq("id", id)
            .select("*")
            .single();

        return res.json(data);
    }
}

const answer = new Answer();
module.exports = { answer };
