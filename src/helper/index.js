function groupTags(oldTags, newTags) {
    const toDelete = oldTags.filter((items) => !newTags.includes(items));
    const toInsert = newTags.filter((items) => !oldTags.includes(items));

    return { toDelete, toInsert };
}

function isValidSignin(credentials) {
    const { email, password } = credentials;
    if (!email || !password) {
        return false;
    }

    if (!isValidEmail(email)) {
        return false;
    }

    return true;
}

function isValidRegister(credentials) {
    const { name, password, email, phone } = credentials;

    if (!name || !password || !email || !phone) {
        return false;
    }

    if (!isValidEmail(email)) {
        return false;
    }

    if (!isValidPhone(phone)) {
        return false;
    }

    return true;
}

function isValidEmail(email) {
    const regEx =
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return email.match(regEx);
}

function isValidPhone(num) {
    return num.match(/\+?([ -]?\d+)+|\(\d+\)([ -]\d+)/);
}

function containStringOnly(str) {
    return str.match(/^[A-Za-z]+$/);
}

function containsAlphaNumsOnly(str) {
    return str.match(/^[a-zA-Z0-9]+$/);
}

function containsAlphaNumsNPunc(str) {
    return str.match(/^(?=.*[A-Z0-9])[\w.,!"'\/$ ]+$/i);
}

function isValidQuestion(formData) {
    const { text, studentId, tags } = formData;

    if (!containStringOnly(text)) return false;
    if (isNaN(studentId)) return false;

    for (const tag of tags) {
        if (!containsAlphaNumsOnly(tag)) return false;
    }

    return true;
}
function isValidAnswer(formData) {
    const { text, studentId, questionId } = formData;
    if (!containsAlphaNumsOnly(text)) return false;
    if (isNaN(studentId) || isNaN(questionId)) return false;

    return true;
}

function isValidLessonUpdate({ code, name, id }) {
    if (!code || !name || id) return false;
    if (!containStringOnly(name)) return false;
    if (!containStringOnly(code)) return false;
    if (!isNaN(id)) return false;

    return true;
}

function isValidQuestionUpdate({ text, id }) {
    if (!text || !id) return false;
    if (!containsAlphaNumsNPunc(text) || isNaN(id)) return false;
}
function isValidTagUpdate(tag, questionId){
    return tag && questionId && containsAlphaNumsOnly(tag) && !isNaN(questionId); 
}
module.exports = {
    isValidAnswer,
    groupTags,
    isValidRegister,
    isValidSignin,
    isValidQuestion,
    containsAlphaNumsOnly,
    containsAlphaNumsNPunc,
    containStringOnly,
    isValidLessonUpdate,
    isValidQuestionUpdate,
    isValidTagUpdate,
};
