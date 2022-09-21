import formData from "form-data"
import Mailgun from "mailgun.js"

Service = {

    /**
     * Send email via Mailgun.
     *
     * @param {string} domainId Domain ID.
     * @param {string} from From email.
     * @param {string} to To email.
     * @param {string} subject Subject.
     * @param {string} html HTML message.
     * @param {string} text Text message.
     * @param {string} filename Optional attachment filename.
     * @param {object} data Optional buffer of attachment data.
     */
    async sendEmail(domainId, from, to, subject, html, text, filename, data) {
        const domain = Domains.findOne(domainId)
        if (!domain) {
            OLog.error(`service.js sendEmail unable to find domainId=${domainId}`)
            return { success : false }
        }
        const mailgunPrivateApiKey = domain.mailgunPrivateApiKey || CX.MAILGUN_PRIVATE_API_KEY
        const mailgun = new Mailgun(formData)
        const mailgunAPI = mailgun.client({username: "api",  key: mailgunPrivateApiKey })
        const mailgunDomain = domain.mailgunDomain || CX.MAILGUN_DOMAIN
        to = domain.mailgunDestinationOverride ? domain.mailgunDestinationOverride : to
        to = _.isArray(to) ? to : [to]
        const messageParams = { from, to, subject, html, text }
        messageParams["o:testmode"] = domain.mailgunTest ? "yes" : "no"
        if (filename && data) {
            messageParams.attachment = [{ filename, data }]
        }
        try {
            OLog.debug(`service.js sendEmail domainId=${domainId} to=${to} subject=${subject} *invoke* MailGun API mailgunTest=${domain.mailgunTest}`)
            mailgunAPI.messages.create(mailgunDomain, messageParams)
            OLog.debug(`service.js sendEmail domainId=${domainId} to=${to} subject=${subject} *success*`)
            VXApp.setSubsystemStatus("MAILGUN", domain, "GREEN", "common.status_mailgun_green")
            return { success : true }
        }
        catch (error) {
            OLog.error(`service.js sendEmail *error* domainId=${domainId} error=${error}`)
            VXApp.setSubsystemStatus("MAILGUN", domain, "RED", "common.status_mailgun_error",
                { errorString: error.toString() } )
            return { success: false, error }
        }
    },

    /**
     * Send SMS message via Twilio.
     *
     * @param {string} domainId Domain ID (to retrieve credentials).
     * @param {string} mobile Mobile phone number.
     * @param {string} messageBody Message body.
     * @param {function} callback Mandatory callback.
     */
    async sendSms(domainId, mobile, messageBody) {
        const domain = Domains.findOne(domainId)
        if (!domain) {
            OLog.error(`service.js sendSms unable to find domainId=${domainId}`)
            return { success : false }
        }
        try {
            const request = {}
            let twilioUser
            mobile = domain.twilioDestinationOverride ? domain.twilioDestinationOverride : mobile
            if (!domain.twilioTest) {
                twilioUser = domain.twilioUser || CX.TWILIO_ACCOUNT_SID
                request.auth = `${twilioUser}:${domain.twilioAuthToken || CX.TWILIO_AUTH_TOKEN}`
                request.params = {
                    "To" : Service.preparePhone(mobile),
                    "From" :domain.twilioFromPhone || CX.TWILIO_FROM_PHONE,
                    "Body" : messageBody
                }
            }
            else {
                twilioUser = CX.TWILIO_ACCOUNT_SID_TEST
                request.auth = `${twilioUser}:${CX.TWILIO_AUTH_TOKEN_TEST}`
                request.params = {
                    "To" : CX.TWILIO_FROM_PHONE_TEST,
                    "From" : CX.TWILIO_FROM_PHONE_TEST,
                    "Body" : messageBody
                }
            }
            const url = `${CX.TWILIO_API_URL_PREFIX}/${twilioUser}/${CX.TWILIO_API_URL_SUFFIX}`
            OLog.debug(`service.js sendSms domainId=${domainId} url=${url} request=${OLog.debugString(request)}`)
            const result = await VXApp.http("POST", url, request)
            OLog.debug(`service.js sendSms domainId=${domainId} url=${url} response=${OLog.debugString(result)}`)
            VXApp.setSubsystemStatus("TWILIO", domain, "GREEN", "common.status_twilio_green")
            return { success : true, result : result }
        }
        catch (error) {
            OLog.error(`service.js sendSms *error* domainId=${domainId} error=${error}`)
            VXApp.setSubsystemStatus("TWILIO", domain, "RED", "common.status_twilio_error", { errorString: error.toString() } )
            return { success: false, error: error }
        }
    },

    /**
     * Prepare a phone number for use in SMS.  This involves stripping it of non-digits
     * and removing the digit "1" from the beginning (if present).
     *
     * @param {string} Phone number.
     * @return {string} Stripped number.
     */
    preparePhone(phone) {
        let stripped = phone.trim().replace(/[^0-9]/g, "")
        if (stripped.indexOf("1") === 0) {
            stripped = stripped.substring(1)
        }
        return stripped
    }
}
