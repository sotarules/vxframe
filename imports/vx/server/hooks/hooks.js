Functions.after.insert((userId) => {
    OLog.debug(`hooks.js functions after insert userId=${userId} _id=${this._id}`)
    VXApp.deployFunction(this._id)
})

Functions.after.update((userId, doc) => {
    OLog.debug(`hooks.js functions after update userId=${userId} docId=${doc._id}`)
    VXApp.deployFunction(doc._id)
})
