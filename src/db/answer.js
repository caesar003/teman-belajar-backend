const { supabase } = require("../config");

class Answer {
    constructor() {}

    async answer(formData, res) {
        const { questionId, studentId, text } = formData;

        const { data } = await supabase
            .from("answers")
            .insert({
                question_id: questionId,
                student_id: studentId,
                text: text,
            })
            .select("*")
            .single();
        return res.json(data);
    }

    async delete(formData, res) {
        const { key, value } = formData;
        const { data } = await supabase.from("answers").delete().eq("id", id);

        return res.json(data);
    }

    async _getVote(id) {
        const { data } = await supabase
            .from("answers")
            .select("vote")
            .eq("id", id)
            .single();

        return data;
    }

    async update(formData, res) {
        const { id, answer } = formData;
        const { data } = await supabase
            .from("answers")
            .update({ answer: answer })
            .eq("id", id)
            .select()
            .single();

        return res.json(data.vote);
    }
    async vote(formData, res) {
        const { vote, id } = formData;

        const currentVote = await this._getVote(id);

        const { data } = await supabase
            .from("answers")
            .update({
                vote: currentVote + vote,
            })
            .select("*")
            .single();

        return res.json(data);
    }
}

const answer = new Answer();
module.exports = { answer };
