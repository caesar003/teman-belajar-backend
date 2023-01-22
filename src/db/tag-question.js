const { db } = require("../config");

class TagQuestion {
    async _cleanup(tagId, cb) {
        /**
         * I might find a better name one day, but so far it sounds quite
         * nice, at a glance you get an idea what this function does,
         * it cleans up the tag if it is no longer used,
         * simply checks if if particular id, still exists in the table
         * and delete it if it doesn't
         */
        const [data] = await db`
            SELECT *
            FROM tag_question
            WHERE tag_id=${tagId} 
        `;

        if (data) return;
        return cb(tagId);
    }
    async get(questionId) {
        const data = await db`
            SELECT tags.id, tags.name 
            FROM tag_question
            JOIN tags on tag_question.tag_id=tags.id
            WHERE question_id=${questionId} 
        `;
        return data;
    }

    async getByTagId(tagId) {
        const data = await db`
            SELECT question_id
            FROM tag_question
            WHERE tag_id=${tagId}
            LIMIT 20;
        `;

        return data.map((item) => item.question_id);
    }

    async _removeByTag(tagId, questionId) {
        const data = await db`
            DELETE FROM tag_question
            WHERE tag_id=${tagId} AND question_id=${questionId}
        `;

        return data;
    }

    async handleUpdate(tag, questionId, Tag) {
        const tagId = await Tag.getId(tag);
        await this._removeByTag(tagId, questionId);
        return this._cleanup(tagId, Tag.remove);
    }

    async insert(tagId, questionId) {
        return await db`
            INSERT INTO tag_question
                (tag_id, question_id)
            VALUES
                (${tagId}, ${questionId});
        `;
    }

    async remove(questionId, cb) {
        const [data] = await db`
            DELETE FROM tag_question
            WHERE question_id=${questionId}
            RETURNING tag_id;
        `;
        return data.forEach((item) => this._cleanup(item.tag_id, cb));
    }
}

const tagQuestion = new TagQuestion();
module.exports = { tagQuestion };
