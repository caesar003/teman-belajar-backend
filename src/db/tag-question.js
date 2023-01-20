const { supabase } = require("../config");

class TagQuestion {
    async _cleanup(tagId, cb) {
        /**
         * I might find a better name one day, but so far it sounds quite
         * nice, at a glance you get an idea what this function does,
         * it cleans up the tag if it is no longer used,
         * simply checks if if particular id, still exists in the table
         * and delete it if it doesn't
         */
        const { data } = await supabase
            .from("tag_question")
            .select("*")
            .eq("tag_id", tagId)
            .single();

        if (data) return;
        return cb(tagId);
    }
    async get(questionId) {
        const { data } = await supabase
            .from("tag_question")
            .select(`tags(*)`)
            .eq("question_id", questionId);

        return data.map((item) => ({ id: item.tags.id, name: item.tags.name }));
    }

    async getByTagId(tagId) {
        const { data } = await supabase
            .from("tag_question")
            .select("question_id")
            .eq("tag_id", tagId)
            .limit(20);

        return data.map((item) => item.question_id);
    }

    async _removeByTag(tagId, questionId) {
        const data = await supabase
            .from("tag_question")
            .delete()
            .eq("tag_id", tagId)
            .eq("question_id", questionId);

        return data;
    }

    async handleUpdate(tag, questionId, Tag) {
        const tagId = await Tag.getId(tag);
        await this._removeByTag(tagId, questionId);
        return this._cleanup(tagId, Tag.remove);
    }

    async insert(tagId, questionId) {
        return await supabase.from("tag_question").insert({
            tag_id: tagId,
            question_id: questionId,
        });
    }

    async remove(questionId, cb) {
        const { data } = await supabase
            .from("tag_question")
            .delete()
            .eq("question_id", questionId)
            .select("tag_id");
        return data.forEach((item) => this._cleanup(item.tag_id, cb));
    }
}

const tagQuestion = new TagQuestion();
module.exports = { tagQuestion };
