const { supabase } = require("../config");

class Tag {
    async remove(id) {
        return await supabase.from("tags").delete().eq("id", id);
    }
    async handleNew(tag, questionId, tagQuestion) {
        /**
         * We want to see if particular tag has already exists,
         * if it is so, then just grab the id so that we can use
         * it to update the relation,
         * if it is not, we need to insert it,
         * either way, we call private method _getTagId
         */

        const tagId = await this._getTagId(tag);
        return tagQuestion.insert(tagId, questionId);
    }

    async _insert(tag) {
        const { data } = await supabase
            .from("tags")
            .insert({ name: tag })
            .select("id")
            .single();

        return data.id;
    }

    async _getTagId(tag) {
        const { data } = await supabase
            .from("tags")
            .select("id")
            .single()
            .eq("name", tag);

        if (!data) return await this._insert(tag);
        return data.id;
    }
}

const tag = new Tag();
module.exports = { tag };
