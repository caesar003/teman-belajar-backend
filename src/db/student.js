const bcrypt = require("bcrypt");
const { supabase } = require("../config");

class Student {
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
