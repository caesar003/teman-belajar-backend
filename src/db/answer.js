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

    async getAnswerCounts(ids) {
        const { data: allAnswers } = await supabase.from("answers").select("*");
        const ranks = ids.map((id) => ({
            id: id.id,
            counts: allAnswers.filter((items) => items.question_id === id.id)
                .length,
        }));

        return ranks.sort((a, b) => b.counts - a.counts).slice(0, 20);
    }

    async _getVote(id) {
        const { data } = await supabase
            .from("answers")
            .select("vote")
            .eq("id", id)
            .single();

        return data.vote;
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

    async vote({ id, vote }, res) {
        const currentVote = await this._getVote(id);
        const data = await this._vote(vote + currentVote, id);

        return res.json(data);
    }

    async _vote(vote, id) {
        const { data } = await supabase
            .from("answers")
            .update({ vote: vote })
            .eq("id", id)
            .select("*")
            .single();

        return data;
    }
}

const answer = new Answer();
module.exports = { answer };
