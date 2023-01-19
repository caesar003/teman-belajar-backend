const bcrypt = require("bcrypt");
const { supabase } = require("../config");

class Student {
    async register(credentials, res) {
        const { password, name, email, phone } = credentials;
        const emailExist = await this._getByEmail(email);
        if (emailExist)
            return res.status(400).json({ error: "Email is already used!" });

        const hash = bcrypt.hashSync(password, 10);
        const { data: student } = await supabase
            .from("students")
            .insert({ name, phone, email, hash })
            .select("*")
            .single();

        delete student.hash;
        return res.json(student);
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
        const { data: student } = await supabase
            .from("students")
            .select("*")
            .eq("email", email)
            .single();
        return student;
    }
}

const student = new Student();
module.exports = { student };
