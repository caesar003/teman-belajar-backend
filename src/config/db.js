require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const postgreUri = process.env.POSTGRE_URI;
const postgreKey = process.env.POSGRE_ANON_KEY;

const supabase = createClient(postgreUri, postgreKey);

module.exports = { supabase };
