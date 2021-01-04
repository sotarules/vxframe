/*
 * Publishing criteria using variable criteria.
 */
"use strict"

Meteor.publish("config", function() {
    if (!this.userId) {
        return []
    }
    const cursor = Config.find( { _id: "1" } );
    OLog.debug(`publications.js config count=${cursor.count()}`, this.userId)
    return cursor
})

Meteor.publish("clipboard", function() {
    if (!this.userId) {
        return []
    }
    const cursor = Clipboard.find( { userId: this.userId } );
    OLog.debug(`publications.js clipboard count=${cursor.count()}`, this.userId)
    return cursor
})

Meteor.publish("olog", function(request) {
    if (!request || !this.userId) {
        return []
    }
    VXApp.adjustPublishingRequest(request, this.userId)
    // Transform message into a REGEX for easier searching:
    if (request.criteria.message) {
        request.criteria.message = new RegExp(request.criteria.message, "i")
    }
    const cursor = Log.find(request.criteria, request.options);
    OLog.debug(`publications.js olog request=${OLog.debugString(request)}`, this.userId)
    return cursor
})

Meteor.publish("events", function(request) {
    if (!request || !this.userId) {
        return []
    }
    VXApp.adjustPublishingRequest(request, this.userId)
    let cursor = Events.find(request.criteria, request.options)
    OLog.debug(`publications.js events request=${OLog.debugString(request)}`, this.userId)
    return cursor
})

Meteor.publish("my_notifications", function(request) {
    if (!request || !this.userId) {
        return [];
    }
    const cursor = Notifications.find(request.criteria, request.options)
    OLog.debug(`publications.js my_notifications publish=${OLog.debugString(request)}`, this.userId)
    return cursor
})

Meteor.publish("current_tenants", function(request) {
    if (!request || !this.userId) {
        return
    }
    VXApp.adjustPublishingRequest(request, this.userId)
    const cursor = Tenants.find(request.criteria)
    OLog.debug(`publications.js current_tenants mode=${request.extra.mode} count=${cursor.count()} publish=${OLog.debugString(request)}`, this.userId)
    return cursor
})

Meteor.publish("current_domains", function(request) {
    if (!request || !this.userId) {
        return
    }
    VXApp.adjustPublishingRequest(request, this.userId)
    const cursor = Domains.find(request.criteria)
    OLog.debug(`publications.js current_domains mode=${request.extra.mode} count=${cursor.count()} publish=${OLog.debugString(request)}`, this.userId)
    return cursor
})

Meteor.publish("current_users", function(request) {
    if (!request || !this.userId) {
        return;
    }
    VXApp.adjustPublishingRequest(request, this.userId)
    const cursor = Meteor.users.find(request.criteria)
    OLog.debug(`publications.js current_users mode=${request.extra.mode} count=${cursor.count()} publish=${OLog.debugString(request)}`, this.userId)
    return cursor
})

Meteor.publish("templates", function(request) {
    if (!request || !this.userId) {
        return;
    }
    VXApp.adjustPublishingRequest(request, this.userId)
    const cursor = Templates.find(request.criteria, request.options)
    OLog.debug(`publications.js templates count=${cursor.count()} publish=${OLog.debugString(request)}`, this.userId)
    return cursor
})

Meteor.publish("functions", function(request) {
    if (!request || !this.userId) {
        return
    }
    VXApp.adjustPublishingRequest(request, this.userId)
    let cursor = Functions.find(request.criteria, request.options)
    OLog.debug(`publications.js functions count=${cursor.count()} publish=${OLog.debugString(request)}`, this.userId)
    return cursor
})

Meteor.publish("my_functions", function(request) {
    if (!request || !this.userId) {
        return [];
    }
    const cursor = Functions.find(request.criteria, request.options)
    OLog.debug(`publications.js my_functions count=${cursor.count()} publish=${OLog.debugString(request)}`, this.userId)
    return cursor
})
