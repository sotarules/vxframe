/*
 * Meteor collections (defined on both client and server).
 */
Config = new Meteor.Collection("config")
Tenants = new Meteor.Collection("tenants")
Domains = new Meteor.Collection("domains")
Log = new Meteor.Collection("olog")
Events = new Meteor.Collection("events")
Transactions = new Meteor.Collection("transactions")
History = new Meteor.Collection("history")
Clipboard = new Meteor.Collection("clipboard")
Notifications = new Meteor.Collection("notifications")
Templates = new Meteor.Collection("templates")
Functions = new Meteor.Collection("functions")
DaemonJobs = new Meteor.Collection("daemonjobs")
