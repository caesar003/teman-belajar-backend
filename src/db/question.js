const { db } = require("../config");
const {
    isValidQuestion,
    groupTags,
     containsAlphaNumsOnly,
} = require("../helper");
const { answer } = require("./answer");
const { tag: Tag } = require("./tag");
const { tagQuestion } = require("./tag-question");
const { student } = require("./student");

class Question {
    /**
     * @param formData - Contains question text, student id, and tags
     * @param res - Callback function that returns the response to the client
     * @description - This method
     *      puts a new row into questions table,
     *      puts tags into the tags table,
     *      as well as the relations between those two,
     *      tag_question
     * @returns question object
     */
    async ask(formData, res) {
        const { text, studentId, tags: formTags } = formData;
        const tags = JSON.parse(formTags);

        if (!isValidQuestion({ text, studentId, tags })) {
            return res.status(400).json({ error: "Bad request!" });
        }

        try {
            const data = await this._insert({ text, student_id: studentId });
            if (tags.length) {
                tags.forEach((tag) => Tag.handleNew(tag, data.id, tagQuestion));
            }
            return res.json(data);
        } catch (error) {
            return res.status(500).json({ error: "Error occured!" });
        }
    }

    /**
     * @param {Number} questionId
     * @returns {void}
     */
    async remove({ id }, res) {
        /**
         * first of all we need to handle tables that are related,
         *  - answer
         *  - tag_question -> remove -> grab tag id -> check if it is still used
         *  - tag
         */
        if (!id || !isNaN(id))
            return res.status(400).json({ error: "Bad request!" });
        await answer.deleteByQuestion(id);
        await tagQuestion.remove(id, Tag.remove);
        return this._remove(id, res);
    }

    async _remove(id, res) {
        if (isNaN(id)) return res.status(400).json({ error: "Bad request" });
        try {
            const data = await db`DELETE FROM questions WHERE id = ${id};`;
            return res.json(data);
        } catch (error) {
            return res.status(500).json({ error: "Error occured!" });
        }
    }

    async get({ id }, res) {
        if (!id || isNaN(id))
            return res.status(400).json({ error: "Bad request!" });
        const [Q] = await db`
            SELECT * FROM questions
            WHERE questions.id=${id}`;

        const [{ value: tags }, { value: answers }, { value: studentInfo }] =
            await Promise.allSettled([
                tagQuestion.get(id),
                answer.getByQuestion(id),
                student.get(Q.student_id),
            ]);

        Q.tags = tags;
        Q.answers = answers;
        Q.student = studentInfo;
        return res.json(Q);
    }

    async getByTag({ tag }, res) {
        if (!containsAlphaNumsOnly(tag))
            return res.status(400).json({ error: "Bad request!" });
        const tagId = await Tag.getId(tag);
        const questionIds = await tagQuestion.getByTagId(tagId);
        const data = await this._getManyByIds(questionIds);

        return res.json(data);
    }

    async _getAllIds() {
        try {
            const data = await db`SELECT id FROM questions;`;
            return data;
        } catch (error) {
            console.log(error);
            return;
        }
    }

    async getLatest(res) {
        try {
            const data = await db`
            SELECT *
            FROM questions
            ORDER BY created_at DESC;
        `;

            return res.json(data);
        } catch (error) {
            return res.status(500).json({ error: "Error occured!" });
        }
    }

    /**
     *
     * @returns
     * @description - We fetch rows that contains most answers,
     */
    async getPopular(res) {
        const ids = await this._getAllIds();
        const questionRanks = await answer.getAnswerCounts(ids);
        const data = await this._getManyByIds(questionRanks.map((m) => m.id));
        return res.json(
            data.map((item) => {
                return {
                    ...item,
                    counts: questionRanks.find((rank) => rank.id === item.id)
                        .counts,
                };
            })
        );
    }

    async _getManyByIds(ids) {
        /**
         * You might want to inspect this method further
         * I kinda feel something's off here
         */
        try {
            const data = `SELECT * FROM questions WHERE id IN (${ids.toString()})`;
            return data;
        } catch (error) {
            console.log(error);
            return;
        }
    }

    async _getVote(id) {
        try {
            const [data] = await db`
            SELECT vote
            FROM questions
            WHERE id=${id} 
        `;
            return data.vote;
        } catch (error) {
            console.log(error);
            return;
        }
    }

    async _insert({ text, student_id }) {
        try {
            const [data] = await db`
            INSERT INTO questions
                (text, student_id)
            VALUES
                (${text}, ${student_id})
            RETURNING *;
        `;

            return data;
        } catch (error) {
            console.log(error);
            return;
        }
    }

    /**
     * Update question
     * @param {*} formData
     * @param {*} res
     * We simply alter the text column in the question table,
     * in addition, we also want to update the tag_question and tags
     * as needed
     */
    async update(formData, res) {
        const { text, id } = formData;
        const oldTags = JSON.parse(formData.oldTags);
        const newTags = JSON.parse(formData.newTags);
        const { toDelete, toInsert } = groupTags(oldTags, newTags);

        /**
         * Delete tag,
         * we have these tag names ["tag1", "tag17", ];
         * What we want is actually, performing a delete operation
         * on tag_question tables, which contains those tag ids,
         *
         */

        if (toDelete.length) {
            toDelete.forEach((item) => tagQuestion.handleUpdate(item, id, Tag));
        }

        if (toInsert.length) {
            toInsert.forEach((item) => Tag.handleNew(item, id, tagQuestion));
        }

        const data = this._update(text, id);
        return res.json(data);
    }

    async _update(text, id) {
        try {
            const data = await db`
                UPDATE questions
                SET text=${text}
                WHERE id=${id}
                RETURNING *;
            `;

            return data;
        } catch (error) {
            console.log(error)
            return
        }
    }

    async vote({ id, vote }, res) {
        if (!vote || isNaN(vote) || !id || isNaN(id)) {
            return res.status(400).json({ error: "Bad request!" });
        }
        try {
            /**
             * I might get back here as I think this hasn't been handled properly
             */
            const currentVote = await this._getVote(id);
            const data = await this._vote(vote + currentVote, id);
            return res.json(data);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Error occured!" });
        }
    }

    async _vote(vote, id) {
        try {
            const [data] = await db`
                UPDATE questions
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

const question = new Question();
module.exports = { question };
