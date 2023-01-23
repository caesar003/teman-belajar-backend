const { db } = require("../config");

class Tag {
    async remove(id) {
        try {
            return await db`DELETE FROM tags where id=${id};`;
        } catch (error) {
            console.log(error);
            return;
        }
    }
    async handleNew(tag, questionId, tagQuestion) {
        /**
         * We want to see if particular tag has already exists,
         * if it is so, then just grab the id so that we can use
         * it to update the relation,
         * if it is not, we need to insert it,
         * either way, we call private method _getTagId
         */

        try {
            const tagId = await this._getId(tag);
            return tagQuestion.insert(tagId, questionId);
        } catch (error) {
            console.log(error);
            return;
        }
    }

    async _insert(tag) {
        try {
            const [data] = await db`
                INSERT INTO tags
                    (name)
                VALUES
                    (${tag})
                RETURNING id;
            `;

            return data.id;
        } catch (error) {
            console.log(error);
            return;
        }
    }

    async _getId(tag) {
        try {
            const [data] = await db`
                SELECT id
                FROM tags
                WHERE name = ${tag}; 
            `;

            if (!data) return await this._insert(tag);
            return data.id;
        } catch (error) {
            console.log(error);
            return;
        }
    }

    async getId(tag) {
        try {
            const [data] = await db`
                SELECT id
                FROM tags
                WHERE name = ${tag}; 
            `;
            if (!data) return null;
            return data.id;
        } catch (error) {
            console.log(error);
            return;
        }
    }
}

const tag = new Tag();
module.exports = { tag };
