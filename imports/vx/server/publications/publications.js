/*
 * Publishing criteria using variable criteria.
 */
"use strict";

Meteor.publish("config", function() {

    var cursor;

    if (!this.userId) {
        return [];
    }

    cursor = Config.find( { _id: "1" } );

    OLog.debug("publications.js config count=" + cursor.count(), this.userId);

    return cursor;
});

Meteor.publish("olog", function(request) {

    var cursor;

    if (!request || !this.userId) {
        return [];
    }

    VXApp.adjustPublishingRequest(request, this.userId);

    // Transform message into a REGEX for easier searching:
    if (request.criteria.message) {
        request.criteria.message = new RegExp(request.criteria.message, "i");
    }

    cursor = Log.find(request.criteria, request.options);

    OLog.debug("publications.js olog count=" + cursor.count() + " request=" + OLog.debugString(request), this.userId);

    return cursor;
});

Meteor.publish("events", function(request) {

    var cursor;

    if (!request || !this.userId) {
        return [];
    }

    VXApp.adjustPublishingRequest(request, this.userId);

    cursor = Events.find(request.criteria, request.options);

    OLog.debug("publications.js events count=" + cursor.count() + " request=" + OLog.debugString(request), this.userId);

    return cursor;
});

Meteor.publish("my_notifications", function(request) {

    var cursor;

    if (!request || !this.userId) {
        return [];
    }

    cursor = Notifications.find(request.criteria, request.options);

    OLog.debug("publications.js my_notifications count=" + cursor.count() + " publish=" + OLog.debugString(request), this.userId);

    return cursor;
});

Meteor.publish("current_tenants", function(request) {

    var cursor;

    if (!request || !this.userId) {
        return;
    }

    VXApp.adjustPublishingRequest(request, this.userId);

    cursor = Tenants.find(request.criteria);

    OLog.debug("publications.js current_tenants mode=" + request.extra.mode + " count=" + cursor.count() + " publish=" + OLog.debugString(request), this.userId);

    return cursor;
});

Meteor.publish("current_domains", function(request) {

    var cursor;

    if (!request || !this.userId) {
        return;
    }

    VXApp.adjustPublishingRequest(request, this.userId);

    cursor = Domains.find(request.criteria);

    OLog.debug("publications.js current_domains mode=" + request.extra.mode + " count=" + cursor.count() + " publish=" + OLog.debugString(request), this.userId);

    return cursor;
});

Meteor.publish("current_users", function(request) {

    var cursor;

    if (!request || !this.userId) {
        return;
    }

    VXApp.adjustPublishingRequest(request, this.userId);

    cursor = Meteor.users.find(request.criteria);

    OLog.debug("publications.js current_users mode=" + request.extra.mode + " count=" + cursor.count() + " publish=" + OLog.debugString(request), this.userId);

    return cursor;
});

Meteor.publish("templates", function(request) {

    var cursor;

    if (!request || !this.userId) {
        return;
    }

    VXApp.adjustPublishingRequest(request, this.userId);

    cursor = Templates.find(request.criteria, request.options);

    OLog.debug("publications.js templates count=" + cursor.count() + " publish=" + OLog.debugString(request), this.userId);

    return cursor;
});

