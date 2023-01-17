const { supabase } = require("../config");

class Answer {
    constructor() {}

    /**
     * We also need to add a method called get(), which is responsible for to
     * get all answers of a particular question
     */

    answer(formData, res) {
        const { questionId, studentId, text } = formData;
        supabase
            .from("answers")
            .insert({ question_id: questionId, student_id: studentId, text })
            .then((data) => {
                return res.json(data);
            })
            .catch((err) => {
                return res.status(500).json({ error: "Error occured" });
            });
    }

    delete(formData, res) {
        const { id } = formData;
        supabase
            .from("answers")
            .delete()
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

    get() {
        /**
         * TODO: complete this method
         */
    }
    update(formData, res) {
        const { id, answer } = formData;
        supabase
            .from("answers")
            .update({ answer: answer })
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

    vote(formData, res) {
        const { vote, id } = formData;
        supabase
            .from("answers")
            .select("vote")
            .eq("id", id)
            .then((data) => {
                console.log(data);
                supabase
                    .from("answers")
                    .update({ vote: vote })
                    .eq("id", id)
                    .then((data) => {
                        console.log(data);
                        return res.json(data);
                    })
                    .catch((err) => {
                        console.log(err);
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
}

const answer = new Answer();
module.exports = { answer };
