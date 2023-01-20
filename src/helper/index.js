function groupTags(oldTags, newTags) {
    const toDelete = oldTags.filter((items) => !newTags.includes(items));
    const toInsert = newTags.filter((items) => !oldTags.includes(items));

    return { toDelete, toInsert };
}

module.exports = { groupTags };
