Mailman = {

    run() {
        if (!Util.getConfigValue("enableMailman")) {
            return
        }
        Mailman.processNotifications()
    },

    processNotifications() {
        let mailRequest = {}
        mailRequest.criteria = { EMAIL_processed : { $exists : false } }
        mailRequest.options = { sort : { date : 1 } }
        Notifications.find(mailRequest.criteria, mailRequest.options).forEach(notification => {
            const desired = Util.isNotificationDesired(notification, "EMAIL")
            //OLog.debug(`mailman.js EMAIL for ${Util.fetchFullName(notification.recipientId)} desired=${desired}`)
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
            const desired = Util.isNotificationDesired(notification, "SMS")
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
    async sendEmail(notification) {
        const from = Util.i18n("common.label_mail_from")
        const to = Util.getUserEmail(notification.recipientId)
        const subject = notification.subjectKey ?
            Util.i18n(notification.subjectKey, notification.variables) : Util.i18n(notification.key, notification.variables)
        const text = Util.i18n(notification.key, notification.variables)
        OLog.debug(`mailman.js sendEmail notificationId=${notification._id} from=${from} to=${to} subject=[${subject}] text=[${text}]`)
        if (!to) {
            OLog.error(`mailman.js sendEmail notificationId=${notification._id} to is missing, send will not occur`)
            VXApp.updateNotification(notification._id, "EMAIL", [ "processed" ])
            return
        }
        const result = await Service.sendEmail(notification.domain, from, to, subject, null, text);
        if (!result.success) {
            OLog.error(`mailman.js sendEmail *error* notificationId=${notification._id} from=${from} to=${to} ` +
                `subject=[${subject}] error=${result.error}`)
            VXApp.updateNotification(notification._id, "EMAIL", [ "processed" ])
            return
        }
        VXApp.updateNotification(notification._id, "EMAIL", [ "processed", "sent" ])
    },

    /**
     * Perform the actual SMS send via Twilio and update the notification record accordingly.
     *
     * @param {object} Notification to send.
     */
    async sendSms(notification) {
        const mobile = Util.getProfileValue("mobile", notification.recipientId)
        const message = Util.i18n(notification.key, notification.variables)
        const body = Util.i18n("common.template_subject", { message : message })
        OLog.debug(`mailman.js sendSms notificationId=${notification._id} mobile=${mobile} body=[${body}]`)
        // If the user didn't set up a mobile number, just bypass SMS:
        if (!mobile || mobile.trim().length === 0) {
            OLog.debug(`mailman.js sendSms recipientId=${notification.recipientId} no mobile number bypassing send`)
            VXApp.updateNotification(notification._id, "SMS", [ "processed" ])
            return
        }
        const result = Service.sendSms(notification.domain, mobile, body)
        if (!result.success) {
            VXApp.updateNotification(notification._id, "SMS", [ "processed" ])
            return
        }
        VXApp.updateNotification(notification._id, "SMS", [ "processed" ])
    }
}

