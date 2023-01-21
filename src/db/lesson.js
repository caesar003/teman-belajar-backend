const { supabase } = require("../config");

class Lesson {
    async get(res) {
        const { data } = await supabase.from("subjects").select("*");
        return res.json(data);
    }

    async add(formData, res) {
        const { code, name } = formData;
        const isCodeUsed = await this._lessonCodeUsed(code);
        if (isCodeUsed)
            return res.status(400).json({
                error: "Lesson code is already used, please choose another",
            });
        const { data } = await supabase
            .from("subjects")
            .insert(formData)
            .select("*")
            .single();
        return res.json(data);
    }

    async _lessonCodeUsed(code) {
        const { data } = await supabase
            .from("subjects")
            .select("*")
            .eq("code", code)
            .single();

        if (data) return true;
        return false;
    }

    async update(formData, res) {
        const { code, name, id } = formData;
        const { data } = await supabase
            .from("subjects")
            .update({ code, name })
            .eq("id", id)
            .select("*")
            .single();

        return res.json(data);
    }
}

const lesson = new Lesson();
module.exports = { lesson };
