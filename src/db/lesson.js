const { db } = require("../config");
const { isValidLessonUpdate } = require("../helper");

class Lesson {
    async get(res) {
        try {
            const data = await db`SELECT * FROM subjects;`;
            return res.json(data);
        } catch (error) {
            console.log(error);
            return;
        }
    }

    async getAll(res) {
        try {
            const lessons = await db`SELECT * from subjects`;
            const qIds = await db`SELECT subject_id from questions`;

            return res.json(
                lessons.map((lesson) => ({
                    ...lesson,
                    question_count: qIds.filter(
                        (item) => item.subject_id === lesson.id
                    ).length,
                }))
            );
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Error occured!" });
        }
    }

    async add(formData, res) {
        const { code, name } = formData;
        const isCodeUsed = await this._lessonCodeUsed(code);
        try {
            if (isCodeUsed)
                return res.status(400).json({
                    error: "Lesson code is already used, please choose another",
                });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                error: "Error occured!",
            });
        }

        try {
            const [data] = await db`
                INSERT INTO subjects
                    (code, name)
                VALUES
                    (${code}, ${name})
                RETURNING *;
            `;
            return res.json(data);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Error occured!" });
        }
    }

    async _lessonCodeUsed(code) {
        try {
            const [data] = await db`
                SELECT *
                FROM subjects
                WHERE code=${code}
            `;

            if (data) return true;
            return false;
        } catch (error) {
            return error;
        }
    }

    async update(formData, res) {
        if (isValidLessonUpdate(formData)) {
            return res.status(400).json({ error: "Bad request!" });
        }
        const { code, name, id } = formData;
        try {
            const [data] = await db`
                UPDATE subjects
                SET code=${code}, name=${name}
                WHERE id=${id}
                RETURNING *;
            `;

            return res.json(data);
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                error: "Error occured",
            });
        }
    }
}

const lesson = new Lesson();
module.exports = { lesson };
