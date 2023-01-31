const { db } = require("../config");
const {
    isValidQuestion,
    groupTags,
    containsAlphaNumsOnly,
    getIpAddress,
} = require("../helper");
const { answer } = require("./answer");
const { tag: Tag } = require("./tag");
const { tagQuestion } = require("./tag-question");
const { student } = require("./student");
const { areAllNumbers, isValidVote } = require("../helper");

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
        // const { subjectId, text, studentId, tags, grade } = formData;
        const { text, studentId, tags, grade, subjectId } = formData;

        if (!isValidQuestion({ text, studentId, grade, subjectId })) {
            return res.status(400).json({ error: "Bad request!" });
        }

        try {
            const data = await this._insert({
                text,
                student_id: studentId,
                subject_id: subjectId,
                grade: grade,
            });
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
         * I altered the constraints on both answers and tag_question tables;
         * So instead of deleting those one by one, we could just remove one question
         * and answers + tag_question would take a good care of themselves;

            alter table tag_question
            drop constraint tag_question_question_id_fkey,
            add constraint tag_question_question_id_fkey
            foreign key ("question_id")
            references "questions"(id)
            on delete cascade;


            alter table answers
            drop constraint answers_question_id_fkey,
            add constraint answers_question_id_fkey
            foreign key ("question_id")
            references "questions"(id)
            on delete cascade;
         */

        if (!id || isNaN(id))
            return res.status(400).json({ error: "Bad request!" });
        try {
            const data = await db`DELETE FROM questions WHERE id = ${id}`;
            return res.json(data);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Error occured!" });
        }
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

    async get(req, res) {
        const { id } = req.params;

        if (!id || isNaN(id))
            return res.status(400).json({ error: "Bad request!" });

        const ip = getIpAddress(req);

        const _vote = await db`
            SELECT vote FROM vote_question
            WHERE question_id = ${id}
        `;

        const vote = _vote.reduce((acc, obj) => acc + parseInt(obj.vote), 0);

        const [Q] = await db`
                SELECT * FROM questions
                WHERE questions.id=${id}`;
        if (!Q)
            return res.status(404).json({ error: "No question with such id" });
        try {
            const [
                { value: tags },
                { value: answers },
                { value: studentInfo },
            ] = await Promise.allSettled([
                tagQuestion.get(id),
                answer.getByQuestion(id),
                student.get(Q.student_id),
            ]);

            await this.#recordView({ ipAddr: ip, questionId: Q.id });

            Q.tags = tags;
            Q.answers = answers;
            Q.student = studentInfo;
            Q.vote = vote;
            return res.json(Q);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Error occured!" });
        }
    }

    async getByTag({ tag }, res) {
        if (!containsAlphaNumsOnly(tag))
            return res.status(400).json({ error: "Bad request!" });
        const tagId = await Tag.getId(tag);
        const questionIds = await tagQuestion.getByTagId(tagId);
        const data = await this._getManyByIds(questionIds);

        return res.json(data);
    }

    async getBySubject({ id }, res) {
        if (!id || isNaN(id))
            return res.status(400).json({ error: "Bad request!" });
        const data = await db`
            SELECT questions.id, questions.grade, questions.created_at, questions.text, questions.vote, questions.student_id, students.name
            from questions
            join students on questions.student_id = students.id
            where subject_id = ${id}
        `;

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
                select questions.id, questions.created_at, text, student_id, students.name as student_name, students.avatar, students.address as student_city,  grade, subjects.code as subject_code, subjects.name as subject_name
                from questions
                join subjects on questions.subject_id = subjects.id
                join students on questions.student_id = students.id
                order by created_at desc;;
            `;

            return res.json(data);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Error occured!" });
        }
    }

    /**
     *
     * @returns
     * @description - We fetch rows that contains most answers,
     */

    /**
     * CREATE TABLE views (
            question_id int,
            ip VARCHAR(100),
            created_at TIMESTAMP
        );

        INSERT INTO VIEWS (question_id, ip, created_at) VALUES (1, '127.0.0.1', NOW()), (2, '127.0.0.2', NOW()), (3, '127.0.0.3', NOW()), (100, '127.0.0.100', NOW());

        SELECT question_id, count(*) as total_views from views WHERE created_at < now() group by question_id order by total_views desc limit 4;
     */
    async getPopular(res) {
        const ranks = await this.#getTodaysPopular();
        const rows = await db`
            SELECT * FROM questions
            where id IN ${db(ranks.map((item) => parseInt(item.question_id)))}
        `;
        if (!rows.length) return res.json([]);

        return res.json(
            rows.map((item) => ({
                ...item,
                view_count: ranks.find((rank) => rank.question_id === item.id)
                    .view_count,
            }))
        );
    }
    async #getTodaysPopular() {
        /**
         * here we look into view_question table on
         * today's date and count them
         */

        const now = new Date().getTime();
        const aDay = 24 * 60 * 60 * 1000;
        const yesterday = new Date(now - aDay);

        try {
            const data = await db`
                SELECT question_id,
                COUNT(*) as view_count
                FROM view_question
                WHERE created_at > ${yesterday}
                group by question_id
                order by view_count desc
                `;
            return data;
        } catch (error) {
            console.log(error);
            return { error: "Error occured!" };
        }
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
            return parseInt(data.vote);
        } catch (error) {
            console.log(error);
            return;
        }
    }

    async _insert({ text, student_id, subject_id, grade }) {
        try {
            const [data] = await db`
            INSERT INTO questions
                (text, student_id, subject_id, grade)
            VALUES
                (${text}, ${student_id}, ${subject_id}, ${grade})
            RETURNING *;
        `;

            return data;
        } catch (error) {
            console.log(error);
            return;
        }
    }

    async #recordView({ ipAddr, questionId }) {
        const [existingRecord] = await db`
            SELECT * FROM view_question
            WHERE ip_address = ${ipAddr}
            AND question_id=${questionId}
            ORDER BY created_at DESC
            LIMIT 1;
            `;

        if (existingRecord) {
            const currentTime = new Date().getTime();
            const lastVisit = new Date(existingRecord.created_at).getTime();

            const timeDifference = currentTime - lastVisit;
            const aDay = 24 * 60 * 60 * 1000;
            if (timeDifference < aDay) return;

            return await db`
                INSERT INTO view_question
                    (ip_address, question_id)
                VALUES
                    (${ipAddr}, ${questionId})`;
        }

        return await db`
                INSERT INTO view_question
                    (ip_address, question_id)
                VALUES
                    (${ipAddr}, ${questionId})`;
    }

    async search({ query }, res) {
        try {
            const data = await db`
                SELECT * from questions
                WHERE text like ${"%" + query + "%"}
            `;
            return res.json(data);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Error occured!" });
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
        const { id, text } = formData;
        if (!id || isNaN(id) || !text) {
            return res.status(400).json({ error: "Bad request!" });
        }

        try {
            const [data] = await db`
                UPDATE questions SET text = ${text}
                WHERE id = ${id}
                RETURNING *;`;
            return res.json(data);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Error occured!" });
        }
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
            console.log(error);
            return;
        }
    }

    /**
     * There are few adjustments we need to make here.
     * First, a student can only vote one question once,
     * So there is no way where a student hit upvote button for thirteen million
     * times and raised it become thirteen million votes
     * And this is how we're gonna do it.
     *
     * First, we'll remove `vote` column on questions/answers table, and replace
     * those with other tables called `vote_question` and `vote_answer` respectively
     *
     * those tables will have the following schema
     * | id     | question_id/answer_id     | student_id | vote |
     * |________|___________________________|____________|______|
     *
     *
     * Handler function (in this case `question.vote` or `answer.vote`) receive
     * form data with the following shape
     * {
     * question_id/answer_id: int,
     * student_id: int,
     * vote: int
     * }
     *
     * Note that vote here can be either 1 or -1
     *
     * Next step, search against the corresponding table for that exact same question_id
     * and that exact same student_id
     *
     * We expect two possible things,
     * First, it is not found
     *      in this case we simply insert a new row;
     * Second, it is there
     *      for this matter, we would like to perform one last check
     *          result.vote === form.vote;
     *      true => return, do nothing;
     *      false => set vote = result.vote + form.vote
     */
    async vote(formData, res) {
        const { id, studentId, vote } = formData;
        if (!areAllNumbers([+id, +studentId, +vote]) || !isValidVote(vote)) {
            return res.status(400).json({ error: "Bad request!" });
        }

        const [existingVote] = await db`
            SELECT * from vote_question
            WHERE question_id = ${id}
            AND student_id = ${studentId}`;

        if (existingVote) {
            if (parseInt(vote) === parseInt(existingVote.vote)) {
                return res.status(304).json({ message: "Not modified!" });
            }
            const _v = parseInt(vote) + parseInt(existingVote.vote);
            const update = await db`
                UPDATE vote_question
                SET vote=${_v}
                WHERE id = ${existingVote.id}`;
            return res.json(update);
        }
        const data = await db`
            INSERT INTO vote_question
                (question_id, student_id, vote)
            VALUES
                (${id}, ${studentId}, ${vote})
            RETURNING *`;
        return res.json(data);
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
