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
    const { text, studentId, grade, subjectId } = formData;
    if (!text || !studentId || !grade || !subjectId) return false;
    if (!areAllNumbers([+studentId, +grade, +subjectId])) return false;
    return true;
}
function isValidAnswer(formData) {
    const { text, studentId, questionId } = formData;
    if (!text || !studentId || !questionId) return false;
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
function isValidTagUpdate(tag, questionId) {
    return (
        tag && questionId && containsAlphaNumsOnly(tag) && !isNaN(questionId)
    );
}
function areAllNumbers(arr) {
    return arr.every((item) => typeof item === "number");
}

function isValidVote(vote) {
    return vote === 1 || vote === -1;
}

function getIpAddress(req) {
    const ips = (
        req.headers["cf-connecting-ip"] ||
        req.headers["x-real-ip"] ||
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        ""
    ).split(",");

    return ips[0].trim();
}

function mergeVotes(answers, votes) {
    const output = answers.map((answer) => ({ ...answer, vote: 0 }));
    votes.forEach((vote) => {
        output.forEach((answer) => {
            if (answer.id === vote.answer_id) {
                answer.vote += parseInt(vote.vote);
            }
        });
    });

    return output;
}

function countVotes(votes) {
    const ids = votes.map();
}

module.exports = {
    areAllNumbers,
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
    isValidVote,
    getIpAddress,
    mergeVotes,
};
