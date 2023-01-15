const { supabase } = require("../config");

class Answer {
    constructor() {}

    answer(formData, res) {
        const { questionId, studentId } = formData;
        supabase
            .from("answers")
            .insert({ question_id: questionId, student_id: studentId })
            .then((data) => {
                console.log(data);
            })
            .catch((err) => {
                console.log(err);
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
            })
            .catch((err) => {
                console.log(err);
            });
    }

    update(formData, res) {
        const { id, answer } = formData;
        supabase
            .from("answers")
            .update({ answer: answer })
            .eq("id", id)
            .then((data) => {
                console.log(data);
            })
            .catch((err) => {
                console.log(err);
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
                    })
                    .catch((err) => {
                        console.log(err);
                    });
                return;
            })
            .catch((err) => {
                console.log(err);
                return;
            });
    }
}

const answer = new Answer();
module.exports = { answer };
