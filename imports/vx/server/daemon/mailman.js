"use strict";

/*
 * Mailman handles e-mail and SMS notifications.
 */
Mailman = {

    run() {
        Mailman.processNotifications()
    },

    processNotifications() {
        let mailRequest = {}
        mailRequest.criteria = { EMAIL_processed : { $exists : false } }
        mailRequest.options = { sort : { date : 1 } }
        Notifications.find(mailRequest.criteria, mailRequest.options).forEach(notification => {
            let desired = Util.isNotificationDesired(notification, "EMAIL")
            OLog.debug("mailman.js EMAIL for " + Util.fetchFullName(notification.recipientId) + " desired=" + desired)
            if (desired) {
                Mailman.sendEmail(notification)
            }
            else {
                VXApp.updateNotification(notification._id, "EMAIL", [ "processed" ])
            }
        })
        mailRequest = {}
        mailRequest.criteria = { SMS_processed : { $exists : false } }
        mailRequest.options = { sort : { date : 1 } }
        Notifications.find(mailRequest.criteria, mailRequest.options).forEach(notification => {
            let desired = Util.isNotificationDesired(notification, "SMS")
            OLog.debug("mailman.js SMS for " + Util.fetchFullName(notification.recipientId) + " desired=" + desired)
            if (desired) {
                Mailman.sendSms(notification)
            }
            else {
                VXApp.updateNotification(notification._id, "SMS", [ "processed" ])
            }
        })
    },

    /**
     * Perform the actual send via Mailgun and update the notification
     * in accord with the outcome.
     *
     * @param {object} Notification to send.
     */
    sendEmail(notification) {
        let from = Util.i18n("common.label_mail_from")
        let to = Util.getUserEmail(notification.recipientId)
        let subject = notification.subjectKey ? Util.i18n(notification.subjectKey, notification.variables) : Util.i18n(notification.key, notification.variables)
        let text = Util.i18n(notification.key, notification.variables)
        OLog.debug("mailman.js sendEmail notificationId=" + notification._id + " from=" + from + " to=" + to + " subject=[" + subject + "] text=[" + text + "]")
        if (!to) {
            OLog.error("mailman.js sendEmail notificationId=" + notification._id + " to is missing, send will not occur")
            VXApp.updateNotification(notification._id, "EMAIL", [ "processed" ])
            return
        }
        Service.sendEmail(notification.domain, from, to, subject, null, text, (error, result) => {
            if (!result.success) {
                OLog.error("mailman.js sendEmail *error* notificationId=" + notification._id + " from=" + from + " to=" + to + " subject=[" + subject + "] error=" + error)
                VXApp.updateNotification(notification._id, "EMAIL", [ "processed" ])
                return
            }
            VXApp.updateNotification(notification._id, "EMAIL", [ "processed", "sent" ])
        })
    },

    /**
     * Perform the actual SMS send via Twilio and update the notification record accordingly.
     *
     * @param {object} Notification to send.
     */
    sendSms(notification) {
        let mobile = Util.getProfileValue("mobile", notification.recipientId)
        let message = Util.i18n(notification.key, notification.variables)
        let body = Util.i18n("common.template_subject", { message : message })
        OLog.debug("mailman.js sendSms notificationId=" + notification._id + " mobile=" + mobile + " body=[" + body + "]")
        // If the user didn't set up a mobile number, just bypass SMS:
        if (!mobile || mobile.trim().length === 0) {
            OLog.debug("mailman.js sendSms recipientId=" + notification.recipientId + " no mobile number bypassing send")
            VXApp.updateNotification(notification._id, "SMS", [ "processed" ])
            return
        }
        Service.sendSms(notification.domain, mobile, body, (error, result) => {
            let parsedContent;
            if (!result.success) {
                VXApp.updateNotification(notification._id, "SMS", [ "processed" ])
                if (!result.error.response) {
                    OLog.error("mailman.js sendSms notificationId=" + notification._id + " no response error=" + result.error)
                    return
                }
                parsedContent = Util.getParsedContent(result.error.response)
                if (!parsedContent) {
                    return;
                }
                if (parsedContent.code === 21605) {
                    OLog.error("mailman.js sendSms notificationId=" + notification._id + " message length exceeded")
                    return
                }
                OLog.error("mailman.js sendSms notificationId=" + notification._id + " send error=" + error)
                return
            }
            parsedContent = Util.getParsedContent(result.result)
            if (!parsedContent) {
                return
            }
            // If the phone number is invalid, simply record as processed only:
            if (parsedContent.code === 21211) {
                VXApp.updateNotification(notification._id, "SMS", [ "processed" ])
                return;
            }
            // Otherwise, record the notification as both processed and sent:
            VXApp.updateNotification(notification._id, "SMS", [ "processed" ], { SMS_messageSid : parsedContent.sid })
        })
    }
}

