const { db } = require("../config");
const { isValidAnswer } = require("../helper");

class Answer {
    async answer(formData, res) {
        if (!isValidAnswer(formData))
            return res.status(400).json({ error: "Bad request!" });
        const { text, studentId, questionId } = formData;
        try {
            const [data] = await db`
            INSERT INTO answers
                (question_id, text, student_id)
            VALUES
                (${questionId}, ${text}, ${studentId})
            RETURNING *;
        `;

            return res.json(data);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Error occured!" });
        }
    }

    async deleteByQuestion(questionId) {
        if (isNaN(questionId)) return;
        try {
            const data = await db`
            DELETE FROM answers
            WHERE question_id=${questionId}
        `;
            return data;
        } catch (error) {
            console.log(error);
            return;
        }
    }

    async getAnswerCounts(ids) {
        try {
            const [allAnswers] = await db`SELECT * FROM answers`;
            const ranks = ids.map((id) => ({
                id: id.id,
                counts: allAnswers.filter(
                    (items) => items.question_id === id.id
                ).length,
            }));

            return ranks.sort((a, b) => b.counts - a.counts).slice(0, 20);
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async getByQuestion(questionId) {
        try {
            const data = await db`
            SELECT 
                answers.id, text, student_id, answers.created_at,
                vote, students.name as student_name
            FROM answers
            JOIN
                students ON answers.student_id=students.id
            WHERE answers.question_id=${questionId}
            order by created_at asc;
        `;

            return data;
        } catch (error) {
            console.log(error);
            return;
        }
    }

    async _getVote(id) {
        try {
            const [data] = await db`SELECT vote FROM answers WHERE id=${id}`;

            return parseInt(data.vote);
        } catch (error) {
            console.log(error);
            return;
        }
    }

    async remove({ id }, res) {
        if (!id) return res.status(400).json({ error: "Bad request!" });
        try {
            const data = await db`DELETE FROM answers WHERE id=${id}`;
            return res.json(data);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Error occured!" });
        }
    }

    async update(formData, res) {
        try {
            const { id, text } = formData;
            const [data] = await db`
                UPDATE answers
                SET text=${text}
                WHERE id=${id}
                RETURNING *;
            `;

            return res.json(data);
        } catch (error) {
            return res.status(500).json({ error: "Error occured!" });
        }
    }

    async vote({ id, vote }, res) {
        if (!id || !vote || isNaN(id) || isNaN(vote)) {
            return res.status(400).json({ error: "Bad request!" });
        }
        try {
            const currentVote = await this._getVote(id);
            const data = await this._vote(parseInt(vote) + currentVote, id);

            return res.json(data);
        } catch (error) {
            return res.status(500).json({ error: "Error occured!" });
        }
    }

    async _vote(vote, id) {
        try {
            const [data] = await db`
            UPDATE answers
            SET vote=${vote}
            WHERE id=${id}
            RETURNING *;
        `;

            return data;
        } catch (error) {
            console.log(error);
            return;
        }
    }
}

const answer = new Answer();
module.exports = { answer };
