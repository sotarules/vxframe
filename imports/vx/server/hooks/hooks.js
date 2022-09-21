Reports.after.insert(function(userId, doc) {
    OLog.debug(`hooks.js reports after insert userId=${userId} _id=${this._id}`)
    VXApp.handleInsert(Reports, userId, doc)
})

Reports.after.update(function(userId, doc, fieldNames, modifier, options) {
    OLog.debug(`hooks.js reports after update userId=${userId} docId=${doc._id}`)
    VXApp.handleUpdate(Reports, userId, doc, fieldNames, modifier, options, this.previous)
})
