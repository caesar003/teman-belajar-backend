const { supabase } = require("../config");
const { tag: Tag } = require("./tag");
const { tagQuestion } = require("./tag-question");

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
        const { text, studentId, tags: formTags } = formData;
        const tags = JSON.parse(formTags);
        const data = await this._insert({ text, student_id: studentId });
        tags.forEach((tag) => Tag.handleNew(tag, data.id, tagQuestion));
        return res.json(data);
    }

    async get({ id }, res) {
        const tags = await tagQuestion.get(id);
        const { data } = await supabase
            .from("questions")
            .select(`*, answers(text, id, created_at, vote)`)
            .eq("id", id)
            .single();

        data.tags = tags;
        return res.json(data);
    }

    async _insert(param) {
        const { data } = await supabase
            .from("questions")
            .insert(param)
            .select()
            .single();
        return data;
    }
}

const question = new Question();
module.exports = { question };
