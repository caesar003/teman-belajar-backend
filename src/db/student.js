const bcrypt = require("bcrypt");
const { db } = require("../config");
const { isValidRegister, isValidSignin } = require("../helper");

class Student {
    async getByEmail ({email}, res) {
        if(!email) {
            return res.status(400).json({error: "Bad request!"})
        }

        try {
            const [data] = await db`
                SELECT  email, id FROM students WHERE email = ${email}
            `;
            if(!data) return res.status(404).json({error: "Not found!"})
            return res.json(data);
        } catch (error) {
            console.log(error);
            return res.status(500).json({error: "Error occured!"})
        }
    }
    async get(id) {
        if (!id || isNaN(id)) {
            return null;
        }
        try {
            
            const [data] = await db`
                SELECT 
                    id, created_at, name, email, phone 
                FROM students 
                WHERE id=${id}`;
            return data;

        } catch (error) {
           console.log(error);
           return; 
        }
    }
    async register(credentials, res) {
        if (!isValidRegister(credentials)) {
            return res
                .status(400)
                .json({ error: "Informasi tidak dapat diproses!" });
        }
        const { password, name, email, phone } = credentials;
        const emailExist = await this._getByEmail(email);
        if (emailExist)
            return res.status(400).json({ error: "Email is already used!" });

        const hash = bcrypt.hashSync(password, 10);
        try {
            const data = await db`
            INSERT INTO students
            (name, email, hash, phone)
            VALUES
            (${name}, ${email}, ${hash}, ${phone})
            RETURNING *;
        `;
            delete data.hash;
            return res.json(data);
        } catch (error) {
            return res.status(500).json({
                error: "Pendaftaran tidak dapat diproses untuk saat ini!",
            });
        }
    }

    async search({ name }, res) {
        if (!name) {
            return res
                .status(400)
                .json({ error: "Can't process the request!" });
        }

        try {
            const data = await db`
            SELECT name, email, phone, id, created_at
            FROM students
            WHERE name LIKE %${name}%
            LIMIT 20;
        `;

            return res.json(data);
        } catch (error) {
            return res.status(500).json({ error: "Error occured!" });
        }
    }

    async signin(credentials, res) {
        if (!isValidSignin(credentials)) {
            return res
                .status(400)
                .json({ error: "Informasi tidak dapat diproses!" });
        }
        const { email, password } = credentials;
        try {
            const student = await this._getByEmail(email);
            if (!student)
                return res
                    .status(404)
                    .json({ error: "No student with such email" });

            const isCorrectPassword = bcrypt.compareSync(
                password,
                student.hash
            );

            if (!isCorrectPassword)
                return res.status(400).json({ error: "Invalid credentials" });

            delete student.hash;
            return res.json(student);
        } catch (error) {
            return res.status(500).json({ error: "Error occured!" });
        }
    }

    async _getByEmail(email) {
        if (!email) return null;
        const [student] = await db`
            SELECT * FROM students
            WHERE email = ${email};
        `;
        return student;
    }
}

const student = new Student();
module.exports = { student };
