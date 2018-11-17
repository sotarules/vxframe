"use strict"

Meteor.methods({

    getSubscriptionParameters : function() {
        return VXApp.getSubscriptionParameters()
    },

    onClientLogin : function(userId, clientVersion) {
        return VXApp.onClientLogin(userId, clientVersion)
    },

    findUserInsensitive : function(email) {
        return Util.findUserInsensitive(email)
    },

    clearPNotify : function(notificationId, sent) {
        return VXApp.clearPNotify(notificationId, sent)
    },

    putImage : function(filename, content) {
        return PkgCloud.putImage(filename, content)
    },

    sendReport : function(userId, reportType, reportParameters) {
        return Reporter.sendReport(userId, reportType, reportParameters)
    },

    setPassword : function(newPassword) {
        return VXApp.setPassword(newPassword)
    },

    cloneUser : function(userId) {
        return VXApp.cloneUser(userId)
    },

    retireUser : function(userId, comment) {
        return VXApp.retireUser(userId, comment)
    },

    retireTenant : function(tenantId, comment) {
        return VXApp.retireTenant(tenantId, comment)
    },

    retireDomain : function(domainId, comment) {
        return VXApp.retireDomain(domainId, comment)
    },

    retireTemplate : function(templateId, comment) {
        return VXApp.retireTemplate(templateId, comment)
    },

    sendEnrollmentEmail : function(userId) {
        return VXApp.sendEnrollmentEmail(userId)
    },

    sendResetPasswordEmail : function(userId) {
        return VXApp.sendResetPasswordEmail(userId)
    },

    createUserDefault : function() {
        return VXApp.createUserDefault()
    },

    createTenant : function() {
        return VXApp.createTenant()
    },

    setCurrentDomain: function(domainId) {
        return VXApp.setCurrentDomain(domainId)
    },

    getDefaultRoute: function() {
        return VXApp.getDefaultRoute()
    },

    clearLogFile : function() {
        return VXApp.clearLogFile()
    },

    validateServerSide : (functionName, validateArgs) => {
        return VXApp.validateServerSide(functionName, validateArgs)
    },

    sendTestEmail : function(templateId) {
        return VXApp.sendTestEmail(templateId)
    },

    performanceSetCapture : (capture) => {
        return Performance.setCapture(capture)
    },

    performanceClear : () => {
        return Performance.clear()
    },

    performanceDump : () => {
        return Performance.dump()
    }
})
