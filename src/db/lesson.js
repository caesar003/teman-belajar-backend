const bcrypt = require("bcrypt");
const { supabase } = require("../config");
class Lesson {
    get(res) {
        supabase
            .from("lessons")
            .select("*")
            .then((data) => {
                console.log(data);
                return res.json(data);
            })
            .catch((err) => {
                console.log(err);
                return res.status(500).json(err);
            });
    }
    add() {}
    update() {}
    delete() {}
}
const lesson = new Lesson();

module.exports = { lesson };
