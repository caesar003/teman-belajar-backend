const { db } = require("../config");

class Answer {
    async answer(formData, res) {
        const { text, studentId, questionId } = formData;
        const [data] = await db`
            INSERT INTO answers
                (question_id, text, student_id)
            VALUES
                (${(questionId, text, studentId)})
            RETURNING *;
        `;

        return res.json(data);
    }

    async deleteByQuestion(questionId) {
        const data = await db`
            DELETE FROM answers
            WHERE question_id=${questionId}
        `;
        return data;
    }

    async getAnswerCounts(ids) {
        const [allAnswers] = await db`SELECT * FROM answers`;
        const ranks = ids.map((id) => ({
            id: id.id,
            counts: allAnswers.filter((items) => items.question_id === id.id)
                .length,
        }));

        return ranks.sort((a, b) => b.counts - a.counts).slice(0, 20);
    }

    async getByQuestion(questionId) {
        const data = await db`
            SELECT 
                answers.id, text, student_id, answers.created_at,
                vote, students.name as student_name
            FROM answers
            JOIN
                students ON answers.student_id=students.id
            WHERE answers.question_id=${questionId}
        `;

        return data;
    }

    async _getVote(id) {
        const [data] = await db`SELECT vote FROM answers WHERE id=${id}`;

        return data.vote;
    }

    async remove({ id }, res) {
        const data = await db`DELETE FROM ansers WHERE id=${id}`;
        return res.json(data);
    }

    async update(formData, res) {
        const { id, text } = formData;
        const [data] = await db`
            UPDATE answers
            SET text=${text}
            WHERE id=${id}
            RETURNING *;
        `;

        return res.json(data);
    }

    async vote({ id, vote }, res) {
        const currentVote = await this._getVote(id);
        const data = await this._vote(vote + currentVote, id);

        return res.json(data);
    }

    async _vote(vote, id) {
        const [data] = await db`
            UPDATE answers
            SET vote=${vote}
            WHERE id=${id}
            RETURNING *;
        `;

        return data;
    }
}

const answer = new Answer();
module.exports = { answer };
