const bcrypt = require("bcrypt");
const { supabase } = require("../config");

class Student {
    getById(id, res) {
        supabase
            .from("students")
            .select("*")
            .eq("id", id)
            .then((data) => {
                console.log(data);
                return res.json(data);
            })
            .catch((err) => {
                console.log(err);
                return res.status(500).json({ error: "Error occured" });
            });
    }

    async register(credentials, res) {
        const { password, name, email, phone } = credentials;
        const emailExists = await this._emailExists(email);

        if (emailExists)
            return res.status(400).json({
                error: "Email already used!",
            });

        const hash = bcrypt.hashSync(password, 10);
        const { data: student } = await supabase
            .from("students")
            .insert({
                name,
                phone,
                email,
                hash,
            })
            .select("*")
            .single();

        delete student.hash;
        return res.json(student);
    }

    search(name, res) {
        supabase
            .from("students")
            .select("*")
            .ilike("name", name)
            .then((data) => {
                console.log(data);
                return res.json(data);
            })
            .catch((err) => {
                console.log(err);
                return res.status(500).json({ error: "Error occured!" });
            });
    }

    async _emailExists(email) {
        console.log(email);
        const { data: student } = await supabase
            .from("students")
            .select("*")
            .eq("email", email)
            .single();

        if (student) return true;

        return false;
    }

    async signin(credentials, res) {
        const { email, password } = credentials;
        const { data: student } = await supabase
            .from("students")
            .select("*")
            .eq("email", email)
            .single();

        if (!student)
            return res.status(404).json({ error: "Invalid credentials!" });
        const isCorrectPassword = bcrypt.compareSync(password, student.hash);

        if (!isCorrectPassword) {
            return res.status(400).json({ error: "Invalid credentials!" });
        }
        delete student.hash;
        return res.json(student);
    }
}

const student = new Student();

module.exports = { student };
