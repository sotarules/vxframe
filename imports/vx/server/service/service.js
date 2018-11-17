"use strict"

Service = {

    /**
     * Send an email via Mailgun.
     *
     * @param {string} domainId Domain ID.
     * @param {string} from From email.
     * @param {string} to To email.
     * @param {string} subject Subject.
     * @param {string} html HTML message.
     * @param {string} text Text message.
     * @param {function} callback Mandatory callback.
     */
    sendEmail : (domainId, from, to, subject, html, text, callback) => {

        try {

            let domain = Domains.findOne(domainId)

            if (!domain) {
                OLog.error("service.js sendEmail unable to find domainId=" + domainId)
                callback(null, { success : false, error : new Error("Unable to find domainId=" + domainId) } )
                return
            }

            let testmode = domain.mailgunTest ? "yes" : "no"
            to = domain.mailgunDestinationOverride ? domain.mailgunDestinationOverride : to

            let params = {}
            params.from = from
            params.to = to
            params.subject = subject
            params["o:testmode"] = testmode

            if (html) {
                params.html = html
            }

            if (text) {
                params.text = text
            }

            let mailgunPrivateApiKey = domain.mailgunPrivateApiKey || CX.MAILGUN_PRIVATE_API_KEY
            let mailgunDomain = domain.mailgunDomain || CX.MAILGUN_DOMAIN

            let sendRequest = { auth : "api:" + mailgunPrivateApiKey, params : params }

            OLog.debug("service.js sendEmail domainId=" + domainId + " from=" + from + " to=" + to + " subject=[" + subject + "]" +
             " mailgunPrivateApiKey=" + mailgunPrivateApiKey + " mailgunDomain=" + mailgunDomain + " sendRequest=" + OLog.debugString(sendRequest))

            HTTP.post(CX.MAILGUN_API + "/" + mailgunDomain + "/messages", sendRequest, (error, result) => {

                // Read back domain so that we have it fresh for setSubsystemStatus:
                domain = Domains.findOne(domainId)
                if (!domain) {
                    OLog.error("service.js sendEmail unable to find domainId=" + domainId)
                    callback(null, { success : false, error : new Error("Unable to find domainId=" + domainId) } )
                    return
                }

                if (error) {
                    OLog.error("service.js sendEmail *error* domainId=" + domainId + " from=" + from + " to=" + to + " subject=[" + subject + "] html=[" + html + "] error=" + error)
                    VXApp.setSubsystemStatus("MAILGUN", domain, "RED", "common.status_mailgun_error", { errorString: error.toString() } )
                    callback(null, { success: false, error : error } )
                    return
                }

                VXApp.setSubsystemStatus("MAILGUN", domain, "GREEN", "common.status_mailgun_green")

                callback(null, { success : true, result : result } )
                return
            })
        }
        catch (error) {
            OLog.error("service.js sendEmail unexpected error=" + error)
            callback(null, { success: false, error: error } )
            return
        }
    },

    /**
     * Send SMS message via Twilio.
     *
     * @param {string} domainId Domain ID (to retrieve credentials).
     * @param {string} mobile Mobile phone number.
     * @param {string} body Message body.
     * @param {function} callback Mandatory callback.
     */
    sendSms : (domainId, mobile, body, callback) => {

        try {

            let domain = Domains.findOne(domainId)
            if (!domain) {
                OLog.error("service.js sendSms unable to find domainId=" + domainId)
                callback(null, { success : false, error : new Error("Unable to find domainId=" + domainId) } )
                return
            }

            let mobile = domain.twilioDestinationOverride ? domain.twilioDestinationOverride : mobile

            let apiUrl, sendRequest

            if (!domain.twilioTest) {

                apiUrl = CX.TWILIO_API_URL_PREFIX + "/" + domain.twilioUser + "/" + CX.TWILIO_API_URL_SUFFIX
                sendRequest = { auth : domain.twilioUser + ":" + domain.twilioAuthToken,
                    params : {
                        "To" : Service.preparePhone(mobile),
                        "From" : encodeURI(domain.twilioFromPhone),
                        "Body" : body
                    }
                }
            }
            else {

                apiUrl = CX.TWILIO_API_URL_PREFIX + "/" + CX.TWILIO_ACCOUNT_SID_TEST + "/" + CX.TWILIO_API_URL_SUFFIX
                sendRequest = {
                    auth : CX.TWILIO_ACCOUNT_SID_TEST + ":" + CX.TWILIO_AUTH_TOKEN_TEST,
                    params : {
                        "To" : encodeURI(CX.TWILIO_FROM_PHONE_TEST),
                        "From" : encodeURI(CX.TWILIO_FROM_PHONE_TEST),
                        "Body" : body
                    }
                }
            }

            OLog.debug("service.js sendSms domainId=" + domainId + " mobile=" + mobile + " body=[" + body + "] sendRequest=" + OLog.debugString(sendRequest))

            HTTP.post(apiUrl, sendRequest, (error, result) => {

                if (error) {
                    OLog.error("service.js sendSms *error* domainId=" + domainId + " mobile=" + mobile + " body=" + body + " error=" + error)
                    VXApp.setSubsystemStatus("TWILIO", domain, "RED", "common.status_twilio_error", { errorString: error.toString() } )
                    callback(null, { success: false, error : error } )
                    return
                }

                VXApp.setSubsystemStatus("TWILIO", domain, "GREEN", "common.status_twilio_green")

                callback(null, { success : true, result : result } )
                return
            })
        }
        catch (error) {
            OLog.error("service.js sendSms unexpected error=" + error)
            callback(null, { success: false, error: error } )
            return
        }
    },

    /**
     * Prepare a phone number for use in SMS.  This involves stripping it of non-digits
     * and removing the digit "1" from the beginning (if present).
     *
     * @param {string} Phone number.
     * @return {string} Stripped number.
     */
    preparePhone : (phone) => {

        var stripped

        stripped = phone.trim().replace(/[^0-9]/g, "")

        if (stripped.indexOf("1") === 0) {
            stripped = stripped.substring(1)
        }

        return stripped
    }
}
