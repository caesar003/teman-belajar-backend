const { supabase } = require("../config");
const { groupTags } = require("../helper");
const { answer } = require("./answer");
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
        if (tags.length) {
            tags.forEach((tag) => Tag.handleNew(tag, data.id, tagQuestion));
        }
        return res.json(data);
    }

    /**
     * @param {Number} questionId
     * @returns {void}
     */
    async remove({ id }, res) {
        /**
         * first of all we need to handle tables that are related,
         *  - answer
         *  - tag_question -> remove -> grab tag id -> check if it is still used
         *  - tag
         */
        await answer.deleteByQuestion(id);
        await tagQuestion.remove(id, Tag.remove);
        return this._remove(id, res);
    }

    async _remove(id, res) {
        const data = await supabase.from("questions").delete().eq("id", id);
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

    async getByTag({ tag }, res) {
        const tagId = await Tag.getId(tag);
        const questionIds = await tagQuestion.getByTagId(tagId);
        const data = await this._getManyByIds(questionIds);

        return res.json(data);
    }

    async _getAllIds() {
        const { data } = await supabase.from("questions").select("id");

        return data;
    }

    async getLatest(res) {
        const { data } = await supabase
            .from("questions")
            .select("*")
            .limit(20)
            .order("created_at", { ascending: false });

        return res.json(data);
    }

    /**
     *
     * @returns
     * @description - We fetch rows that contains most answers,
     */
    async getPopular(res) {
        const ids = await this._getAllIds();
        const questionRanks = await answer.getAnswerCounts(ids);
        const data = await this._getManyByIds(questionRanks.map((m) => m.id));
        return res.json(
            data.map((item) => {
                return {
                    ...item,
                    counts: questionRanks.find((rank) => rank.id === item.id)
                        .counts,
                };
            })
        );
    }
  
    async _getManyByIds(ids) {
        const { data } = await supabase
            .from("questions")
            .select("*")
            .in("id", ids)
            .limit(20);

        return data;
    }

    async _getVote(id) {
        const { data } = await supabase
            .from("questions")
            .select("vote")
            .eq("id", id)
            .single();

        return data.vote;
    }

    async _insert(param) {
        const { data } = await supabase
            .from("questions")
            .insert(param)
            .select()
            .single();
        return data;
    }

    /**
     * Update question
     * @param {*} formData
     * @param {*} res
     * We simply alter the text column in the question table,
     * in addition, we also want to update the tag_question and tags
     * as needed
     */
    async update(formData, res) {
        const { text, id } = formData;
        const oldTags = JSON.parse(formData.oldTags);
        const newTags = JSON.parse(formData.newTags);
        const { toDelete, toInsert } = groupTags(oldTags, newTags);

        /**
         * Delete tag,
         * we have these tag names ["tag1", "tag17", ];
         * What we want is actually, performing a delete operation
         * on tag_question tables, which contains those tag ids,
         *
         */

        if (toDelete.length) {
            toDelete.forEach((item) => tagQuestion.handleUpdate(item, id, Tag));
        }

        if (toInsert.length) {
            toInsert.forEach((item) => Tag.handleNew(item, id, tagQuestion));
        }

        const data = this._update(text, id);
        return res.json(data);
    }

    async _update(text, id) {
        const { data } = await supabase
            .from("questions")
            .update({ text: text })
            .eq("id", id)
            .select("*")
            .single();

        return data;
    }

    async vote({ id, vote }, res) {
        const currentVote = await this._getVote(id);
        const data = await this._vote(vote + currentVote, id);
        return res.json(data);
    }

    async _vote(vote, id) {
        const { data } = await supabase
            .from("questions")
            .update({ vote: vote })
            .eq("id", id)
            .select("*")
            .single();

        return data;
    }
}

const question = new Question();
module.exports = { question };
