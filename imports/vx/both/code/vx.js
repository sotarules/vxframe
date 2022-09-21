VX.common = {

    name(name) {
        if (!CX.REGEX_NAME.test(name)) {
            return { success : false, icon : "TRIANGLE", key : "common.invalid_name" }
        }
        return { success : true }
    },

    date(dateString) {
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

    integer(integerString) {
        const valid = Util.isInteger(integerString)
        if (!valid) {
            return { success : false, icon : "TRIANGLE", key : "common.invalid_integer" }
        }
        return { success : true }
    },

    positive(positiveString) {
        const valid = Util.isPositive(positiveString)
        if (!valid) {
            return { success : false, icon : "TRIANGLE", key : "common.invalid_positive" }
        }
        return { success : true }
    },

    float(floatString) {
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

    country(country) {
        const countryObject = Meteor.i18nMessages.codes.country[country]
        if (!countryObject) {
            return { success : false, icon : "TRIANGLE", key : "common.invalid_country" }
        }
        return { success : true }
    },

    locale(locale) {
        const localeObject = Meteor.i18nMessages.codes.locale[locale]
        if (!localeObject) {
            return { success : false, icon : "TRIANGLE", key : "common.invalid_locale" }
        }
        return { success : true }
    },

    firstName(firstName) {
        if (!CX.REGEX_NAME.test(firstName)) {
            return { success : false, icon : "TRIANGLE", key : "common.invalid_firstName" }
        }
        return { success : true }
    },

    middleName(middleName) {
        if (!CX.REGEX_NAME.test(middleName)) {
            return { success : false, icon : "TRIANGLE", key : "common.invalid_middleName" }
        }
        return { success : true }
    },

    lastName(lastName) {
        if (!CX.REGEX_NAME.test(lastName)) {
            return { success : false, icon : "TRIANGLE", key : "common.invalid_lastName" }
        }
        return { success : true }
    },

    address1() {
        return { success : true }
    },

    address2() {
        return { success : true }
    },

    city(city) {
        if (!CX.REGEX_NAME.test(city)) {
            return { success : false, icon : "TRIANGLE", key : "common.invalid_city" }
        }
        return { success : true }
    },

    state(state) {
        let stateObject = Meteor.i18nMessages.codes.state[state]
        if (!stateObject) {
            return { success : false, icon : "TRIANGLE", key : "common.invalid_state" }
        }
        return { success : true }
    },

    zip(zip, country) {
        if (country === "US") {
            if (!CX.REGEX_ZIP_US.test(zip)) {
                return { success : false, icon : "TRIANGLE", key : "common.invalid_zip" }
            }
        }
        return { success : true }
    },

    phone(input, country) {
        country = country || "US"
        if (!input) {
            return { success : true }
        }
        if (country !== "US") {
            return { success : true }
        }
        const inputArray = input.split("X")
        const phone = inputArray[0]
        const extension = inputArray.length > 1 ? inputArray[1] : null
        if (!CX.REGEX_PHONE_US.test(phone)) {
            return  { success : false, icon : "TRIANGLE", key : "common.invalid_phone" }
        }
        if (extension && !Util.isWholeNumber(extension)) {
            return  { success : false, icon : "TRIANGLE", key : "common.invalid_phone" }
        }
        return { success : true }
    },

    mobile(mobile, country) {
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

    email(email) {
        if (!CX.REGEX_EMAIL_FORMAT.test(email)) {
            return { success : false, icon : "TRIANGLE", key : "common.invalid_email" }
        }
        return { success : true }
    },

    creditCardNumber(creditCardNumber) {
        if (!/[0-9]{16}/.test(creditCardNumber)) {
            return { success : false, icon: "TRIANGLE", key : "common.invalid_credit_card_number" }
        }
        return { success : true }
    },

    expirationDate(expirationDate) {
        try {
            if (expirationDate.length === 4) {
                const mm = parseInt(expirationDate.substring(0, 2))
                const yy = parseInt(expirationDate.substring(2, 4))
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

    cvv(cvv) {
        try {
            if (cvv.length === 3) {
                const cvvInteger = parseInt(cvv)
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

    ipAddress(ipAddress) {
        if (!/\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}\b/.test(ipAddress)) {
            return { success : false, icon : "TRIANGLE", key : "common.invalid_ip_address" }
        }

        return { success : true }
    },

    balance(balance) {
        if (!CX.REGEX_DECIMAL.test(balance)) {
            return { success : false, icon : "TRIANGLE", key : "common.invalid_balance" }
        }
        return { success : true }
    },

    money(money) {
        if (!CX.REGEX_DECIMAL.test(money)) {
            return { success : false, icon : "TRIANGLE", key : "common.invalid_money" }
        }
        return { success : true }
    },

    url(url) {
        if (url && !CX.REGEX_URL.test(url)) {
            return { success : false, icon : "TRIANGLE", key : "common.invalid_url" }
        }
        return { success : true }
    },

    boolean(boolean) {
        if (!(boolean && (boolean.toLowerCase() === "true" || boolean.toLowerCase() === "false"))) {
            return { success : false, icon : "TRIANGLE", key : "common.invalid_boolean" }
        }
        return { success : true }
    },

    calendarDay(day, monthName, year) {
        const result = VX.common.positive(day)
        if (!result.success) {
            return result
        }
        let dayMax = 31
        if (monthName) {
            dayMax = Util.getCodeProperty("monthName", monthName, "dayMax")
            if (monthName === "FEB" && year) {
                dayMax = (year % 4) === 0 ? 29 : 28
            }
        }
        if (day < 1 || day > dayMax) {
            return { success : false, icon : "TRIANGLE", key : "common.invalid_calendar_day" }
        }
        return { success : true }
    },

    token(token) {
        if (!CX.REGEX_TOKEN.test(token)) {
            return { success : false, icon : "TRIANGLE", key : "common.invalid_2fa_token" }
        }
        return { success : true }
    },

    json(json) {
        try {
            JSON.parse(json)
            return {success: true}
        }
        catch (e) {
            // Bury
        }
        return { success : false, icon : "TRIANGLE", key : "common.invalid_json_string" }
    },

    emailDistributionList(recipients) {
        if (!recipients) {
            return { success : true }
        }
        const recipientsArray = recipients.split(";")
        for (let index = 0; index < recipientsArray.length; index++) {
            const result = VX.common.email(recipientsArray[index]?.trim())
            if (!result.success) {
                return result
            }
        }
        return { success : true }
    }
}

VX.login = {

    email(email, confirmationEmail, currentUserId) {
        let user, result
        OLog.debug(`vx.js login email=${email} confirmationEmail=${confirmationEmail} currentUserId=${currentUserId}`)
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
            OLog.debug(`vx.js login email server-side=${email} case insensitve search found no match *valid*`)
            return { success: true }
        }
        if (user._id === currentUserId) {
            OLog.debug("vx.js login email server-side=" + email + " email matches currentUserId=" + currentUserId + " *valid*")
            return { success: true }
        }
        return { success: false, key: "login.invalid_email_in_use", user: user }
    },

    confirm_email(confirmationEmail, email) {
        return VX.login.email(confirmationEmail, email)
    },

    emailsMatch(email1, email2) {
        if (email1 && email2 && email1 != email2) {
            return { success: false, key: "login.invalid_email_mismatch" }
        }
        return { success: true }
    },

    password(password, confirmationPassword) {
        return VX.login.passwordsMatch(password, confirmationPassword)
    },

    confirm_password(confirmationPassword, password) {
        return VX.login.passwordsMatch(confirmationPassword, password)
    },

    passwordsMatch(password1, password2) {
        if (password1 && password2 && password1 != password2) {
            return { success: false, key: "login.invalid_password_mismatch" }
        }
        return { success: true }
    }
}
