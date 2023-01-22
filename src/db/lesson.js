const { db } = require("../config");

class Lesson {
    async get(res) {
        const data = await db`SELECT * FROM subjects;`;
        return res.json(data);
    }

    async add(formData, res) {
        const { code, name } = formData;
        const isCodeUsed = await this._lessonCodeUsed(code);
        if (isCodeUsed)
            return res.status(400).json({
                error: "Lesson code is already used, please choose another",
            });
        const [data] = await db`
            INSERT INTO subjects
                (code, name)
            VALUES
                (${code}, ${name})
            RETURNING *;
        `;
        return res.json(data);
    }

    async _lessonCodeUsed(code) {
        const [data] = await db`
            SELECT *
            FROM subjects
            WHERE code=${code}
        `;

        if (data) return true;
        return false;
    }

    async update(formData, res) {
        const { code, name, id } = formData;

        const [data] = await db`
            UPDATE subjects
            SET code=${code}, name=${name}
            WHERE id=${id}
            RETURNING *;
        `;

        return res.json(data);
    }
}

const lesson = new Lesson();
module.exports = { lesson };
