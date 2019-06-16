"use strict";

VX.common = {

    /**
     * Validate a supplied date.
     *
     * @param {string} dateString Value to validate.
     * @returns {object} Result object.
     */
    date : (dateString) => {

        let testDate, valid

        valid = false

        try {
            testDate = new Date(dateString)
            valid = !isNaN(testDate)
        }
        catch (e) {
            valid = false
        }

        if (!valid) {
            return { success : false, icon : "TRIANGLE", key : "common.invalid_date" }
        }

        return { success : true }
    },

    /**
     * Validate a supplied integer.
     *
     * @param {string} integerString Value to validate.
     * @returns {object} Result object.
     */
    integer : (integerString) => {

        let valid

        valid = Util.isWholeNumber(integerString)

        if (!valid) {
            return { success : false, icon : "TRIANGLE", key : "common.invalid_integer" }
        }

        return { success : true }
    },

    /**
     * Validate a supplied floating-point decimal.
     *
     * @param {string} floatString Value to validate.
     * @returns {object} Result object.
     */
    float : (floatString) => {

        let valid, testFloat

        try {
            testFloat = parseFloat(floatString)
            valid = !isNaN(testFloat)
        }
        catch (error) {
            valid = false
        }

        if (!valid) {
            return { success : false, icon : "TRIANGLE", key : "common.invalid_float" }
        }

        return { success : true }
    },

    /**
     * Validate a country.
     *
     * @param {string} country Value to validate.
     * @returns {object} Result object.
     */
    country : (country) => {

        let countryObject = Meteor.i18nMessages.codes.country[country]

        if (!countryObject) {
            return { success : false, icon : "TRIANGLE", key : "common.invalid_country" }
        }

        return { success : true }
    },

    /**
     * Validate a locale.
     *
     * @param {string} locale Value to validate.
     * @returns {object} Result object.
     */
    locale : (locale) => {

        var localeObject

        localeObject = Meteor.i18nMessages.codes.locale[locale]
        if (!localeObject) {
            return { success : false, icon : "TRIANGLE", key : "common.invalid_locale" }
        }

        return { success : true }
    },

    /**
     * Validate a first name.
     *
     * @param {string} firstName Value to validate.
     * @returns {object} Result object.
     */
    firstName : (firstName) => {

        if (!CX.REGEX_NAME.test(firstName)) {
            return { success : false, icon : "TRIANGLE", key : "common.invalid_firstName" }
        }

        return { success : true }
    },

    /**
     * Validate a middle name.
     *
     * @param {string} middleName Value to validate.
     * @returns {object} Result object.
     */
    middleName : (middleName) => {

        if (!CX.REGEX_NAME.test(middleName)) {
            return { success : false, icon : "TRIANGLE", key : "common.invalid_middleName" }
        }

        return { success : true }
    },

    /**
     * Validate a last name.
     *
     * @param {string} lastName Value to validate.
     * @returns {object} Result object.
     */
    lastName : (lastName) => {

        if (!CX.REGEX_NAME.test(lastName)) {
            return { success : false, icon : "TRIANGLE", key : "common.invalid_lastName" }
        }

        return { success : true }
    },

    /**
     * Validate an address.
     *
     * @returns {object} Result object.
     */
    address1 : () => {
        return { success : true }
    },

    /**
     * Validate an address.
     *
     * @returns {object} Result object.
     */
    address2 : () => {
        return { success : true }
    },

    /**
     * Validate a city.
     *
     * @param {string} city Value to validate.
     * @returns {object} Result object.
     */
    city : (city) => {

        if (!CX.REGEX_NAME.test(city)) {
            return { success : false, icon : "TRIANGLE", key : "common.invalid_city" }
        }

        return { success : true }
    },

    /**
     * Validate a state.
     *
     * @param {string} state Value to validate.
     * @returns {object} Result object.
     */
    state : (state) => {

        let stateObject = Meteor.i18nMessages.codes.state[state]
        if (!stateObject) {
            return { success : false, icon : "TRIANGLE", key : "common.invalid_state" }
        }

        return { success : true }
    },

    /**
     * Validate a zip code.
     *
     * @param {string} zip Zip code.
     * @param {string} country Supplemental data country code.
     * @returns {object} Result object.
     */
    zip : (zip, country) => {

        if (country === "US") {
            if (!CX.REGEX_ZIP_US.test(zip)) {
                return { success : false, icon : "TRIANGLE", key : "common.invalid_zip" }
            }
        }

        return { success : true }
    },

    /**
     * Validate a phone number (assumed to be stripped of all but digits).
     *
     * @param {string} phone Phone number.
     * @param {string} country Supplemental data country code.
     * @returns {object} Result object.
     */
    phone : (phone, country) => {

        if (!phone) {
            return { success : true }
        }

        if (country === "US") {
            if (!CX.REGEX_PHONE_US.test(phone)) {
                return { success : false, icon : "TRIANGLE", key : "common.invalid_phone" }
            }
        }

        return { success : true }
    },

    /**
     * Validate a mobile number (assumed to be stripped of all but digits).
     *
     * @param {string} mobile Phone number.
     * @param {string} country Supplemental data country code.
     * @returns {object} Result object.
     */
    mobile : (mobile, country) => {

        if (!mobile) {
            return { success : true }
        }

        if (country === "US") {
            if (!CX.REGEX_PHONE_US.test(mobile)) {
                return { success : false, icon : "TRIANGLE", key : "common.invalid_mobile" }
            }
        }

        return { success : true }
    },

    email : (email) => {

        if (!CX.REGEX_EMAIL_FORMAT.test(email)) {
            return { success : false, icon : "TRIANGLE", key : "common.invalid_email" }
        }

        return { success : true }
    },

    creditCardNumber : (creditCardNumber) => {

        if (!/[0-9]{16}/.test(creditCardNumber)) {
            return { success : false, icon: "TRIANGLE", key : "common.invalid_credit_card_number" }
        }

        return { success : true }
    },

    expirationDate : (expirationDate) => {

        var mm, yy

        try {
            if (expirationDate.length === 4) {
                mm = parseInt(expirationDate.substring(0, 2))
                yy = parseInt(expirationDate.substring(2, 4))
                if (mm >= 1 && mm <= 12 && yy >= 0 && yy <= 99) {
                    return { success : true }
                }
            }
        }
        catch (error) {
            // Bury
        }

        return { success : false, icon : "TRIANGLE", key : "common.invalid_expiration_date" }
    },

    cvv : (cvv) => {

        var cvvInteger

        try {
            if (cvv.length === 3) {
                cvvInteger = parseInt(cvv)
                if (cvvInteger >= 0 && cvvInteger <= 999) {
                    return { success : true }
                }
            }
        }
        catch (error) {
            // Bury
        }

        return { success : false, icon : "TRIANGLE", key : "common.invalid_cvv" }
    },

    ipAddress : (ipAddress) => {

        if (!/\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}\b/.test(ipAddress)) {
            return { success : false, icon : "TRIANGLE", key : "common.invalid_ip_address" }
        }

        return { success : true }
    },

    balance : (balance) => {

        if (!CX.REGEX_FLOAT.test(balance)) {
            return { success : false, icon : "TRIANGLE", key : "common.invalid_balance" }
        }

        return { success : true }
    },

    money : (money) => {

        if (!CX.REGEX_FLOAT.test(money)) {
            return { success : false, icon : "TRIANGLE", key : "common.invalid_money" }
        }

        return { success : true }
    },

    /**
     * Check for valid URL.
     *
     * @param {string} url URL to test.
     * @return {object} Result object.
     */
    url : (url) => {

        if (url && !CX.REGEX_URL.test(url)) {
            return { success : false, icon : "TRIANGLE", key : "common.invalid_url" }
        }

        return { success : true }
    }
}

VX.login = {

    /**
     * Validate an e-mail.  This function can deal with two-field confirmation and allows the caller
     * to supply an optional "current" user ID that can be used to avoid triggering "email in use"
     * errors when the administrator changes the email to something invalid, but decides to change it
     * back to the original value.  Without this check it would be impossible to do so.
     *
     * @param {string} email Email to validate.
     * @param {string} confirmationEmail Optional confirmation email (required can be passed via extra if no UI confirmation field).
     * @param {string} currentUserId User ID of record currently under maintenance.
     * @returns {object} Result object.
     */
    email: (email, confirmationEmail, currentUserId) => {

        var user, result

        OLog.debug("vx.js login email=" + email + " confirmationEmail=" + confirmationEmail + " currentUserId=" + currentUserId)

        if (!CX.REGEX_EMAIL_FORMAT.test(email)) {
            return { success: false, key: "login.invalid_email" }
        }

        if (confirmationEmail) {
            result = VX.login.emailsMatch(email, confirmationEmail)
            if (result && !result.success) {
                return result
            }
        }

        if (!Meteor.isServer) {
            return { success: true }
        }

        user = Util.findUserInsensitive(email)
        if (!user) {
            OLog.debug("vx.js login email server-side=" + email + " case insensitve search found no match *valid*")
            return { success: true }
        }

        if (user._id === currentUserId) {
            OLog.debug("vx.js login email server-side=" + email + " email matches currentUserId=" + currentUserId + " *valid*")
            return { success: true }
        }

        return { success: false, key: "login.invalid_email_in_use", user: user }
    },

    /**
     * Validate a confirmation email.
     *
     * @param {string} confirmationEmail Confirmation email.
     * @param {string} email Email.
     * @returns {object} Result object.
     */
    confirm_email : (confirmationEmail, email) => {
        return VX.login.email(confirmationEmail, email)
    },

    /**
     * Ensure that email matches confirmation email.
     *
     * @param {string} email1 First email to validate.
     * @param {string} email 2 Second email to valid.
     * @return {object} Result object.
     */
    emailsMatch : (email1, email2) => {

        if (email1 && email2 && email1 != email2) {
            return { success: false, key: "login.invalid_email_mismatch" }
        }

        return { success: true }
    },

    /**
     * Validate a password.
     *
     * @param {string} password.
     * @param {string} confirmation password.
     * @returns {object} Result object.
     */
    password : (password, confirmationPassword) => {
        return VX.login.passwordsMatch(password, confirmationPassword)
    },

    /**
     * Validate a confirmation password.
     *
     * @param {string} confirmation password.
     * @param {string} password.
     * @returns {object} Result object.
     */
    confirm_password : (confirmationPassword, password) => {
        return VX.login.passwordsMatch(confirmationPassword, password)
    },

    /**
     * Ensure that password matches confirmation password.
     *
     * @param {string} password1 to validate.
     * @param {string} password2 to valid.
     */
    passwordsMatch : (password1, password2) => {

        if (password1 && password2 && password1 != password2) {
            return { success: false, key: "login.invalid_password_mismatch" }
        }

        return { success: true }
    }
}
