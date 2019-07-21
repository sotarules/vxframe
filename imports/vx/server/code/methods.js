"use strict"

Meteor.methods({

    getSubscriptionParameters() {
        return VXApp.getSubscriptionParameters()
    },

    onClientLogin(userId, clientVersion) {
        return VXApp.onClientLogin(userId, clientVersion)
    },

    http(method, url, options) {
        return VXApp.http(method, url, options)
    },

    findUserInsensitive(email) {
        return Util.findUserInsensitive(email)
    },

    clearPNotify(notificationId, sent) {
        return VXApp.clearPNotify(notificationId, sent)
    },

    putImage(filename, content) {
        return PkgCloud.putImage(filename, content)
    },

    sendReport(userId, reportType, reportParameters) {
        return Reporter.sendReport(userId, reportType, reportParameters)
    },

    setPassword(newPassword) {
        return VXApp.setPassword(newPassword)
    },

    cloneUser(userId) {
        return VXApp.cloneUser(userId)
    },

    retireUser(userId, comment) {
        return VXApp.retireUser(userId, comment)
    },

    retireTenant(tenantId, comment) {
        return VXApp.retireTenant(tenantId, comment)
    },

    retireDomain(domainId, comment) {
        return VXApp.retireDomain(domainId, comment)
    },

    retireTemplate(templateId, comment) {
        return VXApp.retireTemplate(templateId, comment)
    },

    sendEnrollmentEmail(userId) {
        return VXApp.sendEnrollmentEmail(userId)
    },

    sendResetPasswordEmail(userId) {
        return VXApp.sendResetPasswordEmail(userId)
    },

    createUserDefault() {
        return VXApp.createUserDefault()
    },

    createTenant() {
        return VXApp.createTenant()
    },

    setCurrentDomain(domainId) {
        return VXApp.setCurrentDomain(domainId)
    },

    getDefaultRoute() {
        return VXApp.getDefaultRoute()
    },

    clearLogFile() {
        return VXApp.clearLogFile()
    },

    validateServerSide(functionName, validateArgs) {
        return VXApp.validateServerSide(functionName, validateArgs)
    },

    sendTestEmail(templateId) {
        return VXApp.sendTestEmail(templateId)
    },

    performanceSetCapture(capture) {
        return Performance.setCapture(capture)
    },

    performanceClear() {
        return Performance.clear()
    },

    performanceDump() {
        return Performance.dump()
    }
})
