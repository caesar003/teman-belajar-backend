const bcrypt = require("bcrypt");
const { supabase } = require("../config");

class Student {
    signin(credentials, res) {
        const { email, password } = credentials;
        supabase
            .from("students")
            .select("*")
            .eq("email", email)
            .then(({ data }) => {
                if (data.length === 0) {
                    return res.status(404).json({
                        error: "User with that email does not exist",
                    });
                }
                const student = data[0];
                const isCorrectPassword = bcrypt.compareSync(
                    password,
                    student.hash
                );
                if (!isCorrectPassword) {
                    return res
                        .status(400)
                        .json({ error: "Invalid credentials" });
                }
                delete student.hash;
                return res.json(student);
            })
            .catch((err) => {
                console.log(err);
                return res.status(500).json({ error: "Error occured" });
            });
    }
    register(credentials, res) {
        const { password, name, email, phone } = credentials;
        supabase
            .from("students")
            .select("*")
            .eq("email", email)
            .then(({ data }) => {
                if (data.length) {
                    return res.status(400).json({
                        error: "Email already used!",
                    });
                }

                const hash = bcrypt.hashSync(password, 10);
                supabase
                    .from("students")
                    .insert({
                        name,
                        phone,
                        email,
                        hash,
                    })
                    .then((data) => {
                        console.log(data);
                        return res.json(data);
                        /**
                         {
                                "error": null,
                                "data": null,
                                "count": null,
                                "status": 201,
                                "statusText": "Created"
                            }
                         */
                    })
                    .catch((err) => {
                        return res
                            .status(500)
                            .json({ error: "Error occured!" });
                    });
            })
            .catch((err) => {
                console.log(err);
                return res.status(500).json({ error: "Error occured!" });
            });
    }
    get() {}
}

const student = new Student();

module.exports = { student };
