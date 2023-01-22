const bcrypt = require("bcrypt");
const { db } = require("../config");

class Student {
    async get(id) {
        const [data] = await db`
            SELECT 
                id, created_at, name, email, phone 
            FROM students 
            WHERE id=${id}`;
        return data;
    }
    async register(credentials, res) {
        const { password, name, email, phone } = credentials;
        const emailExist = await this._getByEmail(email);
        if (emailExist)
            return res.status(400).json({ error: "Email is already used!" });

        const hash = bcrypt.hashSync(password, 10);
        const data = await db`
            INSERT INTO students
            (name, email, hash, phone)
            VALUES
            (${name}, ${email}, ${hash}, ${phone})
            RETURNING *;
        `;
        delete data.hash;
        return res.json(data);
    }

    async search({ name }, res) {
        const data = await db`
            SELECT name, email, phone, id, created_at
            FROM students
            WHERE name LIKE %${name}%
            LIMIT 20;
        `;

        return res.json(data);
    }

    async signin(credentials, res) {
        const { email, password } = credentials;
        const student = await this._getByEmail(email);
        if (!student)
            return res
                .status(404)
                .json({ error: "No student with such email" });

        const isCorrectPassword = bcrypt.compareSync(password, student.hash);

        if (!isCorrectPassword)
            return res.status(400).json({ error: "Invalid credentials" });

        delete student.hash;
        return res.json(student);
    }

    async _getByEmail(email) {
        const [student] = await db`
            SELECT * FROM students
            WHERE email = ${email};
        `;
        return student;
    }
}

const student = new Student();
module.exports = { student };
