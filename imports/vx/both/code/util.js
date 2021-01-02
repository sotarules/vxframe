"use strict";

Util = {

    /**
     * Utility function to return null (needed for supplemental values place holders).
     *
     * @return {?} Null.
     */
    getNull() {
        return null
    },

    /**
     * Determine whether a given value is effectively null while treating special
     * cases like false and 0 as non-null.
     *
     * @param {?} value Value to test.
     * @return {boolean} True if the value is "really" null.
     */
    isNullish(value) {
        return value === null || value === undefined || value === ""
    },

    /**
     * Get a string that is spaces or empty when trimmed as null.
     *
     * @param {string} input Input string.
     * @return {?} Returned string or null.
     */
    getEmptyAsNull(input) {
        if (input === null) {
            return null
        }
        input = input.trim()
        if (Util.isNullish(input)) {
            return null
        }
        return input
    },

    /**
     * Get a string that is empty if the input is null.
     *
     * @param {string} input Input string.
     * @return {?} Returned string or null.
     */
    getNullAsEmpty(input) {
        if (Util.isNullish(input)) {
            return ""
        }
        return input
    },

    /**
     * Return an array of the "raw" codes names.
     *
     * @param {string} codeSet Name of code set.
     * @param {string} filter Optional filter criteria.
     * @return {array} Array of code names.
     */
    getCodes(codeSet, filter) {
        let codeNameArray = []
        _.each(Meteor.i18nMessages.codes[codeSet], (codeDefinition, codeName) => {
            if (!filter) {
                codeNameArray.push(codeName)
                return
            }
            _.each(filter, (filterValue, filterName) => {
                if (codeDefinition[filterName] === filterValue) {
                    codeNameArray.push(codeName)
                    return
                }
            })
        })
        return codeNameArray
    },

    /**
     * Get the localization of a given code name.
     *
     * @param {string} codeSet Name of code set (e.g., timeUnit)
     * @param {string} codeName Code (e.g., MINUTE).
     * @return {string} Localized value of code.
     */
    getCodeLocalized(codeSet, codeName) {
        if (!codeName) {
            return
        }
        return Util.i18n(`codes.${codeSet}.${codeName}`)
    },

    /**
     * Return a property from a specified code object.
     *
     * @param {string} codeSet Name of code set (e.g., timeUnit)
     * @param {string} codeName Code (e.g., MINUTE).
     * @param {string} propertyName Property Name (e.g., momentCode)
     * @return {?} Value of specified property.
     */
    getCodeProperty(codeSet, codeName, propertyName) {
        const codeSetObject = Meteor.i18nMessages.codes[codeSet]
        if (!codeSetObject) {
            OLog.error(`util.js getCodeProperty codeSet=${codeSet} is not defined`)
            return
        }
        const codeObject = codeSetObject[codeName]
        if (!codeObject) {
            return
        }
        return codeObject[propertyName]
    },

    /**
     * Return the raw code objects of a specified code set.
     *
     * @param {string} codeSet Code set.
     * @return {object} Code set object.
     */
    getCodeObjects(codeSet) {
        return Meteor.i18nMessages.codes[codeSet]
    },

    /**
     * Return the raw code object for a given code set and code name.
     *
     * @param {string} codeSet Code set.
     * @param {string} codeName Code name
     * @return {object} Code set object.
     */
    getCodeObject(codeSet, codeName) {
        return Util.getCodeObjects(codeSet)?.[codeName]
    },

    /**
     * Return the value of a system configuration field.
     *
     * @param {string} fieldName Name of configuration field to fetch.
     * @return {?} Value of field.
     */
    getConfigValue(fieldName) {
        let fieldList = {}
        fieldList.fields = {}
        fieldList.fields[fieldName] = 1
        let config = Config.findOne("1", fieldList)
        if (!config) {
            OLog.error("util.js getConfigValue unable to find configuration record")
            return
        }
        return config[fieldName]
    },

    /**
     * Pad an integer number to a given size with leading zeros.
     *
     * @param {number} number Number to pad.
     * @param {number} size Size of return value (total digits).
     * @return {string} Input number padded with leading zeros, returned as string.
     */
    pad(number, size) {
        let myReturn = "0000000000000000000" + number
        return myReturn.substr(myReturn.length - size)
    },

    /**
     * Return the name of a given function.
     *
     * @param {function} funktion Function whose name is to be returned.
     * @return {string} Name of function or undefined.
     */
    functionName(funktion) {
        return funktion.name
    },

    /**
     * Given a container object and an object path specified as a string,
     * return an object reference.
     *
     * @param {object} obj Top-level object (e.g., window or global).
     * @param {string} str Fully-qualified object path as string (e.g., "VX.common.email").
     * @return {object} Reference to object.
     */
    ref(obj, str) {
        str = str.split(".")
        for (let i = 0; i < str.length; i++) {
            obj = obj[str[i]]
        }
        return obj
    },

    /**
     * Wrapper for i18n translate function.
     *
     * @param {string} messageId Fully-qualified translation key.
     * @param {object} params Optional variables to insert in message.
     * @return Localized message.
     */
    i18n(messageId, params) {
        try {
            return Util.i18nResolve(Util.i18nRetrieve(messageId), params)
        }
        catch (e) {
            return "### " + messageId + " " + e + " ###"
        }
    },

    /**
     * Retrieve a message or template using a message ID string.
     *
     * @param {string} messageId Message ID string (e.g., "common.label_user_name")
     * @return {string} Message or string (or template with variables).
     */
    i18nRetrieve(messageId) {
        let messageParts = messageId.split(".")
        messageId = messageParts.pop()
        let messages = Meteor.i18nMessages
        while (messageParts.length) {
            messages = messages[messageParts.shift()]
            if (!_.isObject(messages)) {
                throw Error("missing namespace")
            }
        }
        let message = messages[messageId]
        if (!message) {
            throw Error("missing message")
        }
        if (_.isString(message)) {
            return message
        }

        let locale
        if (Meteor.isClient) {
            locale = Store.getState().currentLocale || "en_US"
        }
        else {
            locale = Meteor.locale || "en_US"
        }

        let _ref = locale.split("_")
        let language = _ref[0]
        let territory = _ref[1]
        message = message[language]
        if (_.isString(message)) {
            return message
        }
        if (_.isString(message !== null ? message[territory] : void 0)) {
            return message[territory]
        }
        if (_.isString(message !== null ? message.default : void 0)) {
            return message.default
        }
        throw Error("unknown message format")
    },

    /**
     * Resolve variables within a message template.
     *
     * @param {string} message Message template string.
     * @param {object} params Optional variables to insert into message.
     * @return {string} Message with variables substituted.
     */
    i18nResolve(message, params) {
        params = params || {}
        params.system_name = CX.SYSTEM_NAME
        params.system_email = CX.SYSTEM_EMAIL
        _.each(params, (value, key) => {
            if (typeof value === "undefined") {
                value = Util.i18n("common.label_variable_undefined")
            }
            let regexp = new RegExp("\\{\\{" + key + "\\}\\}", "g")
            message = message.replace(regexp, value)
        })
        return message
    },

    /**
     * Givne a code set and code, return the local value.
     *
     * @param {string} codeSet Code set name (e.g., state).
     * @param {string} codeName Code name (e.g., NY).
     * @return {string} Localized result.
     */
    localizeCode(codeSet, codeName) {
        return codeName ? Util.i18n(`codes.${codeSet}.${codeName}`) : null
    },

    /**
     * Extract the MIME type from the supplied data URI.
     *
     * @param {string} Data URI.
     * @return {string} MIME type (e.g., "image/png").
     */
    getMimeType(content) {
        // Expecting content to be data URI:
        if (content.indexOf("data:") !== 0) {
            return null
        }
        let begin = content.indexOf("image/")
        if (begin < 0) {
            return null
        }
        let end = content.indexOf(";", begin)
        if (end < 0) {
            return null
        }
        return content.substring(begin, end)
    },

    /**
     * Determine whether the specified URL is a data URL.
     *
     * @param {string} URL to test.
     * @param {boolean} True if the URL appears to be a data URL.
     */
    isDataUrl(url) {
        return (url && url.indexOf("data:") === 0)
    },

    /**
     * Determine whether the specified URL is an HTTP URL.
     *
     * @param {string} URL to test.
     * @param {boolean} True if the URL appears to be an HTTP URL.
     */
    isHttpUrl(url) {
        return (url && url.indexOf("http") === 0)
    },

    /**
     * Return an image filename.
     *
     * @param {string} type Type of upload (e.g., "profile")
     * @param {string} content Content in Data URI form (needed to infer file extension).
     * @return {string} File name.
     */
    makeImageFilename(type, content) {
        // User must be logged in:
        let userId = Meteor.userId()
        if (!userId) {
            OLog.error("util.js makeImageFilename invalid state user must be logged in")
            return
        }
        let guid = Util.getGuid()
        let mimeType = Util.getMimeType(content)
        let extension = CX.IMAGE_MIME_EXTENSION_MAP[mimeType]
        if (!extension) {
            OLog.error("util.js makeImageFilename illegal argument error, unsupported image type=" + mimeType)
            return
        }
        return CX.URL_IMAGE_PREFIX + "/" + type + "/" + userId + "/" + guid + "." + extension
    },

    /**
     * Clone an existing Amazon S3 image URL giving it a new GUID.
     *
     * @param {string} Original URL.
     * @return {string} New URL with new GUID.
     */
    makeImageUrlClone(oldurl) {
        let prefix = oldurl.substring(0, oldurl.lastIndexOf("/"))
        let extension = oldurl.substring(oldurl.lastIndexOf("."))
        return prefix + "/" + Util.getGuid() + extension
    },

    /**
     * Generate random GUID.
     *
     * @returns {string} GUID.
     */
    getGuid() {
        return Random.id()
    },

    /**
     * Generate a Meteor/MongoDB ID reusing Meteor's own internal logic.
     *
     * @param {string} collectionName Collection name lowercase (e.g., "cards").
     * @return {string} Mongo DB ID.
     */
    getMongoId(collectionName) {
        return DDP.randomStream("/collection/" + collectionName).id()
    },

    /**
     * Safely get the specified profile property from the current or optionally-specified user.
     *
     * @param {string} Name of user profile property.
     * @param {?} userOrId Optional User object or ID.
     * @return {?} Value of property or null.
     */
    getProfileValue(prop, userOrId) {
        if (_.isObject(userOrId)) {
            return userOrId.profile[prop]
        }
        userOrId = userOrId || Meteor.userId()
        let fieldList = {}
        fieldList.fields = {}
        fieldList.fields["profile." + prop] = 1
        let user = Meteor.users.findOne(userOrId, fieldList)
        if (!user || !user.profile) {
            return null
        }
        return user.profile[prop]
    },

    /**
     * Get the user's primary e-mail (i.e., the one used to instantiate the
     * account).
     *
     * @param {?} userOrId Optional User object or ID.
     * @returns {string} Primary e-mail address.
     */
    getUserEmail(userOrId) {
        if (_.isObject(userOrId)) {
            return userOrId.emails && userOrId.emails.length > 0 ? userOrId.emails[0].address : null
        }
        userOrId = userOrId || Meteor.userId()
        let user = Meteor.users.findOne(userOrId, { fields: { emails: 1 }})
        if (!user) {
            return null
        }
        return user.emails && user.emails.length > 0 ? user.emails[0].address : null
    },

    /**
     * Get the "user" part of the supplied email.
     *
     * @param {string} Fully-qualified e-mail address.
     * @return {string} Part of e-mail address prior to "@".
     */
    getEmailUser(full) {
        if (!full) {
            return null
        }
        let atIndex = full.indexOf("@")
        if (atIndex < 1) {
            return null
        }
        return full.substring(0, atIndex)
    },

    /**
     * Pad a record number to five digits, supplying leading zeros.
     *
     * @param {number} Record number to be padded.
     * @return {string} Record number as string with leading zeros.
     */
    padRecordNumber(number) {
        return Util.pad(number, 5)
    },

    /**
     * Return the full name of the specified user.
     *
     * @param {?} userOrId User object or ID.
     * @return {string} Full name of user if available, otherwise email address.
     */
    fetchFullName(userOrId) {
        let user
        if (!userOrId) {
            return
        }
        if (_.isObject(userOrId)) {
            user = userOrId
        }
        else {
            user = Meteor.users.findOne({ _id: userOrId }, { fields: { "profile.firstName": 1, "profile.middleName": 1, "profile.lastName": 1 } })
            if (!user) {
                OLog.error("util.js fetchFullName unable to find userOrId=" + userOrId)
                return
            }
        }
        let formattedName = Util.formatFullName(user.profile.firstName, user.profile.middleName, user.profile.lastName)
        if (formattedName) {
            return formattedName
        }
        return Util.getUserEmail(userOrId)
    },

    /**
     * Return the first name of the specified user.
     *
     * @param {?} userOrId User object or ID.
     * @return {string} First name if available.
     */
    fetchFirstName(userOrId) {
        return Util.getProfileValue("firstName", userOrId)
    },

    /**
     * Return the last name of the specified user.
     *
     * @param {?} userOrId User object or ID.
     * @return {string} Last name if available.
     */
    fetchLastName(userOrId) {
        return Util.getProfileValue("lastName", userOrId)
    },

    /**
     * Return the photo URL of the specified user.
     *
     * @param {?} userOrId User object or ID.
     * @return {string} Photo URL or default.
     */
    fetchUserPhotoUrl(userOrId) {
        let photoUrl = Util.getProfileValue("photoUrl", userOrId)
        return photoUrl ? photoUrl : CX.CLOUDFILES_IMAGE + "/" + "user.png"
    },

    /**
     * Return formatted phone number of a specified user.
     *
     * @param {?} userOrId User object or ID.
     * @return {string} Formatted phone number.
     */
    fetchUserPhone(userOrId) {
        let phone = Util.getProfileValue("phone", userOrId)
        let country = Util.getProfileValue("country", userOrId)
        return FX.phoneUS.render(phone, country)
    },

    /**
     * Return formatted mobile number of a specified user.
     *
     * @param {?} userOrId User object or ID.
     * @return {string} Formatted mobile number.
     */
    fetchUserMobile(userOrId) {
        let mobile = Util.getProfileValue("mobile", userOrId)
        let country = Util.getProfileValue("country", userOrId)
        return FX.phoneUS.render(mobile, country)
    },

    /**
     * Fetch a user record limiting the fields to only the profile.
     *
     * @param {string} selector Mongo selector.
     * @return {object} User object (limited).
     */
    fetchUserLimited(selector) {
        return Meteor.users.findOne(selector, { fields: CX.USER_LIMITED_FIELDS })
    },

    /**
     * Return an array of all users with the specified role suitable for populating a <select> list.
     *
     * @param {string} roleName Role name (e.g., MANAGER).
     * @param {string} chosenUserId User ID chosen.
     * @return {array} Array of users bearing given role (prepared for <select>).
     */
    fetchUsersByRole(roleName, chosenUserId) {
        let criteria = {}
        criteria["profile.dateRetired"] = { $exists: false }
        if (Util.isTenantRole(roleName)) {
            criteria["profile.domains"] = { $elemMatch: { domainId : { $in: Util.getDomainIdsOfCurrentTenant() } } }
        }
        else {
            criteria["profile.domains"] = { $elemMatch: { domainId : Util.getCurrentDomainId(Meteor.userId()) } }
        }
        let userArray = []
        Meteor.users.find(criteria).forEach(user => {
            if (Util.isUserRole(user._id, roleName)) {
                let fullName = Util.fetchFullName(user._id)
                let selected = (user._id === chosenUserId)
                userArray.push( { userId : user._id, lastName: user.profile.lastName, fullName : fullName, selected : selected } )
            }
        })
        userArray.sort((userA, userB) => {
            return userA.fullName.localeCompare(userB.fullName)
        })
        return userArray
    },

    /**
     * Return the name of the specified filed in a domain.
     *
     * @param {string} domainId Domain ID.
     * @param {string} fieldName Field name (e.g., "name").
     * @return {string} Field value.
     */
    fetchDomainField(domainId, fieldName) {
        if (!domainId) {
            return
        }
        let fieldList = {}
        fieldList.fields = {}
        fieldList.fields[fieldName] = 1
        let domain = Domains.findOne({ _id: domainId }, fieldList)
        if (!domain) {
            OLog.error("util.js fetchDomainField unable to find domainId=" + domainId)
            return
        }
        return domain[fieldName]
    },

    /**
     * Format a full name given first, middle and last names separated by spaces.
     *
     * @param {string} First name.
     * @param {string} Middle name.
     * @param {string} Last name.
     */
    formatFullName(firstName, middleName, lastName) {
        let myReturn = ""
        if (firstName) {
            myReturn += firstName
        }
        if (middleName) {
            myReturn += (myReturn ? " " + middleName : middleName)
        }
        if (lastName) {
            myReturn += (myReturn ? " " + lastName : lastName)
        }
        return myReturn
    },

    /**
     * Format the supplied date/time as a string (US format for now).
     *
     * @param {object} date Date object.
     * @param {boolean} milliseconds True to return time portion including milliseconds.
     * @param {boolean} stacked True to return date/time stacked with <br> line separator.
     * @return {string} Date Time formatted as string.
     */
    formatDateTime(date, milliseconds, stacked) {
        return Util.formatDate(date) + (stacked ? "<br>" : " ") + Util.formatTime(date, milliseconds)
    },

    /**
     * Format the supplied date as a string (US format for now).
     *
     * @param {object} date Date object.
     * @param {string} timezone Optional timezone.
     * @param {string} format Optional format.
     * @return {string} Date formatted as string.
     */
    formatDate(date, timezone, format) {
        if (!timezone) {
            return Util.pad(date.getMonth() + 1, 2) + "/" + Util.pad(date.getDate(), 2) + "/" + Util.pad(date.getFullYear(), 4)
        }
        format = format || "MM/DD/YYYY hh:mm:ss A"
        return moment.tz(date, timezone).format(format)
    },

    /**
     * Format the supplied date as a string (US format for now).
     *
     * @param {object} Date object.
     * @return {string} Date formatted as string.
     */
    formatDateTwoDigitYear(date) {
        return (date.getMonth() + 1) + "/" + date.getDate() + "/" + Util.pad(date.getYear(), 2)
    },

    /**
     * Format the supplied time as a string (US format for now).
     *
     * @param {object} Date object.
     * @param {boolean} True to return time portion including milliseconds.
     * @return {string} Time formatted as string.
     */
    formatTime(date, milliseconds) {
        return Util.pad(date.getHours(), 2) + ":" + Util.pad(date.getMinutes(), 2) + ":" + Util.pad(date.getSeconds(), 2) +
            (milliseconds ? "." + Util.pad(date.getMilliseconds(), 3) : "")
    },

    /**
     * Format date time with respect to the given user's time zone.
     *
     * @param {date} date Date object with standard UTC date.
     * @param {string} userId User ID
     * @param {boolean} showTime True to include time.
     * @return {string} Date and time returned with respect to the user's time zone.
     */
    formatDateForUser(date, userId, showTime) {
        let timezone = Util.getUserTimezone(userId)
        let mask = showTime ? "MMM D YYYY h:mm A" : "MMM D YYYY"
        return moment.tz(date, timezone).format(mask)
    },

    /**
     * Format a full address given all necessary inputs.
     *
     * @param {string} Address 1.
     * @param {string} Address 2.
     * @param {string} City.
     * @param {string} State.
     * @param {string} Zip.
     */
    formatFullAddress(address1, address2, city, state, zip) {
        let result = ""
        if (address1) {
            result += address1
        }
        if (address2) {
            result += (result ? "<br/>" + address2 : address2)
        }
        if (city) {
            result += (result ? "<br/>" + city : city)
        }
        if (state) {
            result += (result ? ", " + state : state)
        }
        if (zip) {
            result += (result ? " " + zip : zip)
        }
        return result
    },

    /**
     * Format a zero-based version number with label.
     *
     * @param {version} version Version number.
     * @return {string} Formatted version number string.
     */
    formatVersion(version) {
        return Util.i18n("common.label_version_text", { version: (version + 1) })
    },

    /**
     * Format an input value expressed in cents as US dollars.
     *
     * @param {number} cents Input value in cents.
     * @return {string} String formatted as currency US dollars.
     */
    formatCentsAsDollars(cents) {
        cents = cents / 100.0
        return "$" + cents.toFixed(2)
    },

    /**
     * Format a number with commas.
     *
     * @param {number} number to format.
     * @returns {string} Number formatted with commas.
     */
    formatNumberWithCommas(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    },

    /**
     * Format a number as money with dollar sign and commas.
     *
     * @param {number} number to format.
     * @returns {string} Number formatted with dollar sign and commas.
     */
    formatMoney(number) {
        return accounting.formatMoney(number)
    },

    /**
     * Format a number as a percentage.
     *
     * @param {number} number to format.
     * @returns {string} Number formatted as percentage.
     */
    formatPercentage(number) {
        return number.toFixed(2) + "%"
    },

    /**
     * Format a card number.
     *
     * @param {string} creditCardNumber Card number to format.
     * @returns {string} Number formatted as card number.
     */
    formatCreditCardNumber(creditCardNumber) {
        if (!creditCardNumber) {
            return
        }
        try {
            return creditCardNumber.substring(0, 4) + " " +
                creditCardNumber.substring(4, 8) + " " +
                creditCardNumber.substring(8, 12) + " " +
                creditCardNumber.substring(12, 16)
        }
        catch (error) {
            OLog.error("util.js formatCreditCardNumber error=" + error)
            return
        }
    },

    /**
     * Format a card expiration date.
     *
     * @param {string} expirationDate Card expiration date.
     * @returns {string} Number formatted card expiration date.
     */
    formatExpirationDate(expirationDate) {
        if (!expirationDate) {
            return
        }
        try {
            return expirationDate.substring(0, 2) + " " + expirationDate.substring(2, 4)
        }
        catch (error) {
            OLog.error("util.js expirationDate error=" + error)
            return
        }
    },

    /**
     * Determine whether the specified array is either undefined or has no elements.
     *
     * @param {array} array Array to be tested.
     * @return {boolean} True if array is either undefined or has zero elements.
     */
    isEmpty(array) {
        return !array || array.length === 0
    },

    /**
     * Return the user timezone.
     *
     * @param {?} userOrId User object or ID.
     * @return {string} Timezone if available.
     */
    getUserTimezone(userOrId) {
        return Util.getProfileValue("timezone", userOrId)
    },

    /**
     * Test whether the current route path begins with the specified string or
     * any of an array of strings.
     *
     * @param {?} stringOrArray String or array of route prefixes.
     * @return {boolean} True if the current route path begins with the specified string.
     */
    isRoutePath(stringOrArray) {
        let path = Util.routePath()
        if (!stringOrArray || !path) {
            return false
        }
        if (_.isString(stringOrArray)) {
            return path.indexOf(stringOrArray) === 0
        }
        if (_.isArray(stringOrArray)) {
            let found = false
            _.every(stringOrArray, routePrefix => {
                if (path.indexOf(routePrefix) === 0) {
                    found = true
                    return false
                }
                return true
            })
            return found
        }
        return false
    },

    /**
     * Return the current route path.
     *
     * @return {string} Current route path as string (e.g., "/cards").
     */
    routePath() {
        return BrowserHistory.location.pathname
    },

    /**
     * Return the first segment of the specified route path.
     *
     * @param {string} path Route path.
     * @return {string} Segment 1 of route path.
     */
    routeFirstSegment(path) {
        if (!path) {
            return null
        }
        return path.split("/")[1]
    },

    /**
     * Return the specified part of a composite primary key (which is separated by slashes).
     *
     * @param {string} key Composite primary key.
     * @param {number} index Index number (0 is first segment).
     * @return {string} Segment of primary key.
     */
    getKeyPart(key, index) {
        if (!key) {
            return null
        }
        return key.split("/")[index]
    },

    /**
     * Return the first property name of the supplied object.
     *
     * @param {object} object Object.
     * @return {string} First property name or undefined.
     */
    firstProperty(object) {
        if (!object) {
            return
        }
        let keyArray = Object.keys(object)
        if (!keyArray || keyArray.length === 0) {
            return
        }
        return keyArray[0]
    },

    /**
     * Safely parse HTTP return content.
     *
     * @param {string} result HTTP result.
     * @return {object} Parsed content or undefined.
     */
    getParsedContent(result) {
        let parsedContent
        if (!result.content) {
            OLog.error("util.js getParsedContent result has no content, error=" + OLog.errorString(result))
            return
        }
        try {
            parsedContent = JSON.parse(result.content)
        }
        catch (e) {
            OLog.error("util.js getParsedContent  result cannot parse JSON=" + result.content)
            return
        }
        return parsedContent
    },

    /**
     * Get the current date in the form of a Unix timestamp.
     */
    getUnixTimestamp() {
        return Math.floor(new Date().getTime() / 1000)
    },

    /**
     * Remove a trailing slash from an input string.
     *
     * @param {string} input Input string.
     * @return {string} Input string with trailing slash removed.
     */
    stripTrailingSlash(input) {
        return input.replace(/\/$/, "")
    },

    /**
     * Given a database error, create a standard result object.
     *
     * @param {object} error Database error.
     * @return {object) Result object.
     */
    getDatabaseErrorResult(error) {
        if (error.error === 400) {
            return {
                success: false,
                type: "ERROR",
                icon: "EYE",
                key: "common.alert_schema_validation_failed"
            }
        }
        if (error.error === 403) {
            return {
                success: false,
                type: "ERROR",
                icon: "EYE",
                key: "common.alert_database_modification_check_failed"
            }
        }
        return {
            success: false,
            type: "ERROR",
            icon: "BUG",
            key: "common.alert_unexpected_error",
            variables: {
                error: error.toString()
            }
        }
    },

    /**
     * Find a user be case-insensitive email address.
     *
     * @param {string} email Email address.
     * @return {object} Matching user record or null.
     */
    findUserInsensitive(email) {
        let findRegex = new RegExp("^" + email + "$", "i")
        return Meteor.users.findOne({ "emails.address": findRegex }, {
            fields: {
                "username": 1,
                "email.address": 1,
                "profile.firstName": 1,
                "profile.middleName": 1,
                "profile.lastName": 1
            }
        })
    },

    /**
     * Get number in parentheses.
     *
     * @param {string} input String containing number in parentheses.
     * @return {number} Number contained within the parentheses.
     */
    getNumberInParentheses(input) {
        if (!input) {
            return
        }
        let regExp = /\(([^)]+)\)/
        let matches = regExp.exec(input)
        let integer
        if (matches.length < 1) {
            OLog.error("util.js getNumberInParentheses input=" + input + " could not match regex expression to find parentheses")
            return
        }
        try {
            integer = parseInt(matches[1])
        }
        catch (error) {
            OLog.error("util.js getNumberInParentheses input=" + input + " could not be parsed as integer via parseInt")
            return
        }
        return integer
    },

    /**
     * Get a string without a parenthetical value.
     *
     * @param {string} input String containing number in parentheses.
     * @return {number} Number contained within the parentheses.
     */
    getStringWithoutParentheses(input) {
        if (!input) {
            return
        }
        let parentheticalValue = Util.getNumberInParentheses(input)
        if (!parentheticalValue) {
            return
        }
        input.replace("(" + parentheticalValue + ")", "")
        return input.trim()
    },

    /**
     * Strip a currency value of dollar sign and commas.  Automatically convert N/A to zero.
     *
     * @param {string} currency String containing money value with dollar signs and commas or "N/A".
     * @return {number} Decimal number.
     */
    stripMoney(currency) {
        if (!currency) {
            return
        }
        if (currency === "N/A") {
            return 0.00
        }
        return Number(currency.replace(/[^0-9-\.]+/g, ""))
    },

    /**
     * Strip an integer of commas.
     *
     * @param {string} integer String containing commas.
     * @return {number} Number without commas.
     */
    stripCommas(integer) {
        if (!integer) {
            return
        }
        if (integer === "N/A") {
            return 0.00
        }
        return integer.replace(/\,/g, "")
    },

    /**
     * Strip a decimal percentage string and return a decimal percentage.
     *
     * @param {string} percent String with percent sign and decimal point.
     * @return {number} Decimal number.
     */
    stripPercent(percent) {
        return parseFloat(percent)
    },

    /**
     * Determine whether a given value is a whole number.
     *
     * @param {string} input Input value.
     * @return {boolean} True if input is a whole number.
     */
    isWholeNumber(input) {
        return CX.REGEX_INTEGER.test(input)
    },

    /**
     * Given a string input, return either the while number value of that input
     * or null if the value is non-numeric or empty.
     *
     * @param {string} input Input field.
     * @return {number} Number or null.
     */
    getWholeNumber(input) {
        return Util.isWholeNumber(input) ? parseInt(input) : null
    },

    /**
     * Given a string input, return either the floating point equivalent
     * or null if the value is non-numeric or empty.
     *
     * @param {string} input Input field.
     * @return {number} Number or null.
     */
    getFloat(input) {
        return CX.REGEX_FLOAT.test(input) ? parseFloat(input) : null
    },

    /**
     * Return the system user ID.
     *
     * @return {string} System user ID.
     */
    getSystemUserId() {
        return "1"
    },

    /**
     * Determine whether a given ID is the system user ID.
     *
     * @param {string} userId User ID to test.
     * @return {boolean} True if the supplied ID is the system user ID.
     */
    isSystemUserId(userId) {
        return userId === Util.getSystemUserId()
    },

    /**
     * Remove unsightly plus signs and decode URI component.
     *
     * @param {string} Raw input from REST API.
     * @return {string} Decoded result with plus signs replaced.
     */
    decode(input) {
        if (!input) {
            return input
        }
        return decodeURIComponent(input.replace(/\+/g, " "))
    },

    /**
     * Safely trim a string if non-null.
     *
     * @param {string} input Input string.
     * @return {string} String trimmed or null.
     */
    trim(input) {
        if (!input) {
            return null
        }
        return input.trim()
    },

    /**
     * Resolve variable references within a given string.
     *
     * @param {string} template String containing variables.
     * @param {object} variables Variables and their corresponding values.
     * @return {string} String with variables substituted.
     */
    resolveVariables(template, variables) {
        if (variables) {
            _.each(variables, (variableValue, variableName) => {
                let regex = new RegExp("\\{\\{" + variableName + "\\}\\}", "g")
                template = template.replace(regex, variableValue)
            })
        }
        return template
    },

    /**
     * Scale floating point number to two decimal places.
     *
     * @param {number} input Floating point number.
     * @return {number} Number scaled to two digits.
     */
    scaleMoney(number) {
        return +(number.toFixed(2))
    },

    /**
     * Determine whether a given event warrants any notifications.
     *
     * @param {object} event Event to test.
     * @return {boolean} notify True if the event warrants notification.
     */
    isNotificationWarranted() {
        return true
    },

    /**
     * Determine whether the specified mode of notification is desired by the recipient.
     *
     * @param {object} notification Notification record.
     * @param {string} mode Mode of notification.
     * @return {boolean} True if mode of notification is desired.
     */
    isNotificationDesired(notification, mode) {
        let user = Meteor.users.findOne(notification.recipientId)
        if (!user) {
            return false
        }
        // Some special notifications have no event type, in such case there can be no EMAIL or SMS.
        if (!notification.eventType) {
            return false
        }
        return Util.isNotificationEnabled(user, notification.eventType, mode)
    },

    /**
     * For a given user, determine whether a specified notification mode is effectively
     * enabled for a given event type, taking into account defaults and user-specified
     * opt-in and opt-out preferences.
     *
     * @param {object} user User record.
     * @param {string} eventType Event type (e.g., CARD_SLOWPACE).
     * @param {string} mode Notification mode (e.g., PNOTIFY).
     * @return {boolean} True if notification mode is effectively enabled.
     */
    isNotificationEnabled(user, eventType, mode) {
        let eventTypeObject = Meteor.i18nMessages.codes.eventType[eventType]
        let notificationPreference = _.findWhere(user.profile.notificationPreferences, { eventType: eventType })
        let checked = _.contains(eventTypeObject.notificationDefaults, mode)
        if (notificationPreference) {
            if (checked) {
                if (_.contains(notificationPreference.optOut, mode)) {
                    // Default is checked but user has opted out (contradicted):
                    checked = false
                }
                else {
                    // Default checked and user hasn't opted out do nothing
                }
            }
            else {
                if (_.contains(notificationPreference.optIn, mode)) {
                    // Default is unchecked but user has opted in (contradicted):
                    checked = true
                }
                else {
                    // Default is unchecked and user hasn't opted in, do nothing
                }
            }
        }
        return checked
    },

    /**
     * For scheduling email reports, given a reportFrequency, timeUnit, timeOption, timezone and
     * optional lastDate, compute and return the nextDate that the report should run.
     *
     * @param {number} Report frequency.
     * @param {string} Time unit (see codes.timeUnit and also supports "SECOND" undocumented).
     * @param {string} Time option (see codes.timeOptions).
     * @param {string} Timezone in IANA format.
     * @param {date} Optional last date.
     * @return {date} Next date that the report should execute.
     */
    computeNextDate(reportFrequency, timeUnit, timeOption, timezone, lastDate) {
        lastDate = lastDate || new Date()
        let lastMoment = moment.tz(lastDate, timezone)
        let nextMoment = lastMoment.clone()
        //OLog.debug("util.js computeNextDate lastMoment="+lastMoment.format()+" using "+reportFrequency+" "+timeUnit+" "+timeOption+" "+timezone)
        if (timeUnit === "SECOND") {
            nextMoment.add(reportFrequency, "seconds")
        }
        if (timeUnit === "MINUTE") {
            nextMoment.startOf("minute")
            nextMoment.add(reportFrequency, "minutes")
            if (timeOption === "BOTTOM") {
                nextMoment.add(30, "seconds")
            }
        }
        if (timeUnit === "HOUR") {
            nextMoment.startOf("hour")
            nextMoment.add(reportFrequency, "hours")
            if (timeOption === "BOTTOM") {
                nextMoment.add(30, "minutes")
            }
        }
        if (timeUnit === "DAY") {
            nextMoment.startOf("day")
            nextMoment.add(reportFrequency, "days")
            if (timeOption === "SIXAM") nextMoment.add(6, "hours")
            if (timeOption === "NOON") nextMoment.add(12, "hours")
            if (timeOption === "SIXPM") nextMoment.add(18, "hours")
            if (timeOption === "MIDNIGHT") nextMoment.add(24, "hours")
        }
        if (timeUnit === "WEEK") {
            nextMoment.startOf("day")
            nextMoment.add(reportFrequency, "weeks")
            if (timeOption === "SUNDAY") nextMoment.day(0)
            if (timeOption === "MONDAY") nextMoment.day(1)
            if (timeOption === "TUESDAY") nextMoment.day(2)
            if (timeOption === "WEDNESDAY") nextMoment.day(3)
            if (timeOption === "THURSDAY") nextMoment.day(4)
            if (timeOption === "FRIDAY") nextMoment.day(5)
            if (timeOption === "SATURDAY") nextMoment.day(6)
        }
        if (timeUnit === "MONTH") {
            nextMoment.startOf("month")
            nextMoment.add(reportFrequency, "months")
            if (timeOption === "FIRSTDAY") nextMoment.startOf("month").startOf("day")
            if (timeOption === "LASTDAY") nextMoment.endOf("month").startOf("day")
            if (timeOption === "FIRSTMONDAY") {
                nextMoment.startOf("month").startOf("day")
                while (nextMoment.day() !== 1) {
                    nextMoment.add(1, "day")
                }
            }
            if (timeOption === "LASTFRIDAY") {
                nextMoment.endOf("month").startOf("day")
                while (nextMoment.day() !== 5) {
                    nextMoment.subtract(1, "day")
                }
            }
        }
        return nextMoment.toDate()
    },

    /**
     * Get the moment code (e.g., "hours", "days") for a given time unit.
     *
     * @param {string} timeUnit Time unit (e.g., "HOURS").
     * @return {string} Moment code.
     */
    getMomentCode(timeUnit) {
        return Meteor.i18nMessages.codes.timeUnit[timeUnit].momentCode
    },

    /**
     * Determine whether the specified preference is set in the user profile.
     *
     * @param {string} preferenceDefinition Name of preference (see codes.preferenceDefinition).
     * @param {string} userOrId User or ID.
     * @return {boolean} True if preference is present and set to true.
     */
    isPreference(preferenceDefinition, userOrId) {
        let user
        if (!_.isObject(userOrId)) {
            userOrId = userOrId || Meteor.userId()
            user = Meteor.users.findOne(userOrId, { fields: { "profile.standardPreferences": 1 }})
        }
        if (!user || !user.profile || !user.profile.standardPreferences) {
            return false
        }
        let preferenceObject = _.findWhere(user.profile.standardPreferences, { preferenceDefinition: preferenceDefinition })
        if (!preferenceObject) {
            return false
        }
        return preferenceObject.preferenceValue
    },

    /**
     * Get the domain name.
     *
     * @param {string} domainId Domain ID.
     * @returns {string} Domain name.
     */
    fetchDomainName(domainId) {
        let domain = Domains.findOne(domainId, { fields: { name: 1 }})
        if (!domain) {
            return
        }
        return domain.name
    },

    /**
     * Determine whether a user is a super administrator.
     *
     * @param {string} userId User ID.
     * @return {boolean} True if user is super administrator.
     */
    isUserSuperAdmin(userId) {
        userId = userId || Meteor.userId()
        return Util.getProfileValue("superAdmin", userId) === true
    },

    /**
     * Determine whether a user is a tenant administrator.
     *
     * @param {string} userId User or ID.
     * @param {string} tenantId Tenant ID.
     * @return {boolean} True if user carries TENANTADMIN role within the tenant.
     */
    isUserTenantAdmin(userId, tenantId) {
        userId = userId || Meteor.userId()
        tenantId = tenantId || Util.getCurrentTenantId(userId)
        return Util.doesUserHaveRole(userId, tenantId, "TENANTADMIN")
    },

    /**
     * Determine whether a user is a domain administrator.
     *
     * @param {string} userId User ID.
     * @param {string} domainId Domain ID.
     * @return {boolean} True if user carries DOMAINADMIN role within the domain.
     */
    isUserDomainAdmin(userId, domainId) {
        userId = userId || Meteor.userId()
        domainId = domainId || Util.getCurrentDomainId(userId)
        return Util.doesUserHaveRole(userId, domainId, "DOMAINADMIN")
    },

    /**
     * Determine whether a user is any kind of administrator.
     *
     * @param {string} userId User ID.
     * @return {boolean} True if user is any kind of administrator.
     */
    isUserAdmin(userId) {
        return Util.isUserSuperAdmin(userId) || Util.isUserTenantAdmin(userId) || Util.isUserDomainAdmin(userId)
    },

    /**
     * Determine whether the user has the specified role, either in a specific domain
     * or in the user's current domain.
     *
     * @param {string} userId User ID.
     * @param {string} roleName Role name.
     * @param {string} domainId Optional domain ID.
     * @return {boolean} True if the user has the specified role name.
     */
    isUserRole(userId, roleName, domainId) {
        domainId = domainId || Util.getCurrentDomainId(Meteor.userId())
        let tenantOrDomainId = Util.getTenantOrDomainId(roleName, domainId)
        switch (roleName) {
        case "SUPERADMIN":
            return Util.isUserSuperAdmin(userId)
        case "TENANTADMIN":
            return Util.isUserTenantAdmin(userId, tenantOrDomainId)
        case "DOMAINADMIN":
            return Util.isUserDomainAdmin(userId, tenantOrDomainId)
        }
        return false
    },

    /**
     * Determine whether the specified user has a role within a specified tenant or domain.
     *
     * @param {string} userId User ID.
     * @param {string} tenantOrDomainId Tenant or domain ID.
     * @param {string} roleName Role name.
     * @return {boolean} True if role name is enabled.
     */
    doesUserHaveRole(userId, tenantOrDomainId, roleName) {
        if (!userId || !tenantOrDomainId || !roleName) {
            return false
        }
        let checkTenant = Util.isTenantRole(roleName)
        let fieldList = {}
        fieldList.fields = {}
        fieldList.fields["profile." + (checkTenant ? "tenants" : "domains")] = 1
        let user = Meteor.users.findOne(userId, fieldList)
        if (!user) {
            return false
        }
        let tenantsOrDomains = user.profile && (checkTenant ? user.profile.tenants : user.profile.domains)
        if (!tenantsOrDomains) {
            return false
        }
        let tenantOrDomain = _.findWhere(tenantsOrDomains, (checkTenant ? { tenantId: tenantOrDomainId } : { domainId: tenantOrDomainId }))
        if (!tenantOrDomain) {
            return false
        }
        if (!tenantOrDomain.roles) {
            return false
        }
        return _.contains(tenantOrDomain.roles, roleName)
    },

    /**
     * Determine whether the specified role name is a tenant-level role.
     *
     * @param {string} roleName Role name.
     * @return {boolean} True if role name is a tenant-level role.
     */
    isTenantRole(roleName) {
        return roleName === "TENANTADMIN"
    },

    /**
     * Determine whether the specified user is currently a member of a given tenant.
     *
     * @param {string} userId User ID.
     * @param {string} tenantId Tenant ID.
     * @return True if user is currently a member of the tenant.
     */
    isUserTenant(userId, tenantId) {
        return _.contains(Util.getTenantIds(userId), tenantId)
    },

    /**
     * Determine whether the specified user is currently a member of a given domain.
     *
     * @param {string} userId User ID.
     * @param {string} domainId Domain ID.
     * @return True if user is currently a member of the domain.
     */
    isUserDomain(userId, domainId) {
        return Util.getCurrentDomainId(userId) === domainId
    },

    /**
     * Return the name of the specified tenant.
     *
     * @param {string} tenantId Tenant ID.
     * @return {string} Name of tenant.
     */
    fetchTenantName(tenantId) {
        return Util.fetchTenantField(tenantId, "name", Util.i18n("common.label_variable_undefined"))
    },

    /**
     * Return the official name of the specified tenant.
     *
     * @param {string} tenantId Tenant ID.
     * @return {string} Official name of tenant.
     */
    fetchTenantOfficialName(tenantId) {
        let officialName = Util.fetchTenantField(tenantId, "officialName")
        if (officialName) {
            return officialName
        }
        // Fall back to tenant name for pre-signup tenants:
        return Util.fetchTenantName(tenantId)
    },

    /**
     * Return the description of the specified tenant.
     *
     * @param {string} tenantId Tenant ID.
     * @return {string} Description of tenant.
     */
    fetchTenantDescription(tenantId) {
        return Util.fetchTenantField(tenantId, "description")
    },

    /**
     * Return the icon URL of the specified tenant.
     *
     * @param {string} tenantId Tenant ID.
     * @return {string} Icon URL or default.
     */
    fetchTenantIconUrl(tenantId) {
        let iconUrl = Util.fetchTenantField(tenantId, "iconUrl")
        return iconUrl ? iconUrl : CX.CLOUDFILES_IMAGE + "/" + "tenant.png"
    },

    /**
     * Return tenant POC user ID.
     *
     * @param {string} tenantId Tenant ID.
     * @return {string} POC user ID.
     */
    fetchTenantPocUserId(tenantId) {
        return Util.fetchTenantField(tenantId, "pocUserId")
    },

    /**
     * Return the name of the specified field in a tenant.
     *
     * @param {string} tenantId Tenant ID.
     * @param {string} fieldName Field name (e.g., "name").
     * @param {string} defaultValue Optional default value.
     * @return {string} Field value.
     */
    fetchTenantField(tenantId, fieldName, defaultValue) {
        if (!tenantId) {
            return
        }
        let fieldList = {}
        fieldList.fields = {}
        fieldList.fields[fieldName] = 1
        let tenant = Tenants.findOne(tenantId, fieldList)
        if (!tenant) {
            //OLog.error("util.js fetchTenantField unable to find tenantId=" + tenantId)
            return
        }
        return tenant[fieldName] ? tenant[fieldName] : defaultValue
    },

    /**
     * Return the description of the specified domain.
     *
     * @param {string} domainId Domain ID.
     * @return {string} Description of domain.
     */
    fetchDomainDescription(domainId) {
        return Util.fetchDomainField(domainId, "description")
    },

    /**
     * Return the icon URL of the specified domain.
     *
     * @param {?} domainOrId Domain record or ID.
     * @return {string} Icon URL or default.
     */
    fetchDomainIconUrl(domainOrId) {
        let iconUrl = _.isString(domainOrId) ?
            Util.fetchDomainField(domainOrId, "iconUrl") : domainOrId.iconUrl
        return iconUrl ? iconUrl : CX.CLOUDFILES_IMAGE + "/" + "domain.png"
    },

    /**
     * Return the current tenant ID (indirectly via profile.currentDomain from users collection).
     *
     * @param {string} userId Optional user ID.
     * @return {string} Domain ID or undefined.
     */
    getCurrentTenantId(userId) {
        let domainId = Util.getCurrentDomainId(userId)
        if (!domainId) {
            return
        }
        let domain = Domains.findOne(domainId, { fields: { tenant: 1 } })
        return domain && domain.tenant
    },

    /**
     * Determine whether a given tenant is current for a given user.
     *
     * @param {string} tenantId Tenant ID.
     * @param {string} userId Optional user ID.
     * @return {boolean} True if tenant is current.
     */
    isTenantCurrent(tenantId, userId) {
        userId = userId || Meteor.userId()
        return tenantId === Util.getCurrentTenantId(userId)
    },

    /**
     * Return the current domain ID.
     *
     * @param {?} userOrId User or ID.
     * @return {string} Domain ID or UNKNOWN.
     */
    getCurrentDomainId(userOrId) {
        // There is no way to default the ID.  If we try to use Meteor.userId() we will
        // fail when this method is called directly or indirectly from publishing functions.
        if (!userOrId) {
            return "UNKNOWN"
        }
        let user
        if (_.isString(userOrId)) {
            user = Meteor.users.findOne(userOrId, { fields: { "profile.currentDomain": 1 }})
            if (!user) {
                return "UNKNOWN"
            }
        }
        else {
            user = userOrId
        }
        // If profile domain is active, use it:
        if (Util.isDomainActive(user.profile.currentDomain)) {
            return user.profile.currentDomain
        }
        return "UNKNOWN"
    },

    /**
     * Determine whether a given domain is current for a given user.
     *
     * @param {string} domainId Tenant ID.
     * @param {string} userId Optional user ID.
     * @return {boolean} True if tenant is current.
     */
    isDomainCurrent(domainId, userId) {
        userId = userId || Meteor.userId()
        return domainId === Util.getCurrentDomainId(userId)
    },

    /**
     * Return an array of all tenant IDs associated with the specified user ID.
     *
     * @param {string} userId User ID.
     * @param {boolean} includeRetiredTenants True to include retired tenants.
     * @param {boolean} excludeBaseTenants True to exclude base tenants.
     * @return {array} Array of tenant IDs.
     */
    getTenantIds(userId, includeRetiredTenants, excludeBaseTenants) {
        if (!userId) {
            return []
        }
        let user = Meteor.users.findOne(userId, { fields: { "profile.tenants": 1 } })
        if (!user) {
            OLog.error("util.js getTenantIds unable to find userId=" + userId)
            return []
        }
        return _.filter(_.pluck(user.profile.tenants, "tenantId"), tenantId => {
            if (!includeRetiredTenants && !Util.isTenantActive(tenantId)) {
                return false
            }
            if (excludeBaseTenants && Util.isTenantBase(tenantId)) {
                return false
            }
            return true
        })
    },

    /**
     * Return an array of all domain IDs associated with the specified user ID.
     *
     * @param {string} userId User ID.
     * @param {string} tenantId Optional Tenant ID to filter.
     * @param {string} includeRetiredDomains True to include retired domains.
     * @return {array} Array of domain IDs.
     */
    getDomainIds(userId, tenantId, includeRetiredDomains) {
        if (!userId) {
            return []
        }
        let user = Meteor.users.findOne(userId, { fields: { "profile.domains": 1 } })
        if (!user) {
            OLog.error("util.js getDomainIds unable to find userId=" + userId)
            return []
        }
        return _.filter(_.pluck(user.profile.domains, "domainId"), domainId => {
            if (!includeRetiredDomains && !Util.isDomainActive(domainId)) {
                return false
            }
            if (tenantId) {
                return Util.getTenantId(domainId) === tenantId
            }
            return true
        })
    },

    /**
     * Return an array of all domain IDs associated with the current tenant.
     *
     * @param {string} userId Optional user ID.
     * @param {boolean} includeRetiredDomains True to include retired domains.
     * @return {array} Array of domain IDs (strings).
     */
    getDomainIdsOfCurrentTenant(userId, includeRetiredDomains) {
        userId = userId || Meteor.userId()
        let tenantId = Util.getCurrentTenantId(userId)
        return Util.findDomainsInTenant(userId, tenantId, includeRetiredDomains).map(domain => domain._id)
    },

    /**
     * Find the domains in the specified tenant.

     * @param {string} userId User ID.
     * @param {string} tenantId Tenant ID.
     * @param {string} includeRetiredDomains True to include retired domains.
     * @return {array} Array of domains in the tenant.
     */
    findDomainsInTenant(userId, tenantId, includeRetiredDomains) {
        let domainIds = Util.getDomainIds(userId, tenantId, includeRetiredDomains)
        let criteria = {}
        criteria._id = { $in: domainIds }
        return Domains.find(criteria).fetch()
    },

    /**
     * Get a map domainId -> [userRole].
     *
     * @param {array} domains Domain array.
     * @param {object} userOrId User object or ID.
     * @return {object} Map domainId -> [userRole].
     */
    domainRolesMap(domains, userOrId) {
        let userDomains = Util.getProfileValue("domains", userOrId)
        let domainRolesMap = {}
        domains.forEach(domain => {
            let domainObject = _.findWhere(userDomains, { domainId : domain._id })
            if (domainObject) {
                domainRolesMap[domain._id] = domainObject.roles
            }
        })
        return domainRolesMap
    },

    /**
     * Get a map userId -> [userRole].
     *
     * @param {array} domains Domain array.
     * @param {object} domainOrId Domain object or ID.
     * @return {object} Map userId -> [userRole].
     */
    userRolesMap(users, domainOrId) {
        let domainId = _.isObject(domainOrId) ? domainOrId._id : domainOrId
        let userRolesMap = {}
        users.forEach(user => {
            let userDomains = Util.getProfileValue("domains", user)
            let domainObject = _.findWhere(userDomains, { domainId : domainId })
            if (domainObject) {
                userRolesMap[user._id] = domainObject.roles
            }
        })
        return userRolesMap
    },

    /**
     * Determine whether a given value (e.g. path) starts with any of a supplied
     * array of strings (e.g., list of paths).
     *
     * @param {array} stringArray Array of strings to test.
     * @param {string} value Value to be tested.
     * @return {boolean} True if any string in the array starts with the value.
     */
    startsWith(stringArray, value) {
        let found = false
        stringArray.every(testString => {
            if (value.startsWith(testString)) {
                found = true
                return false
            }
            return true
        })
        return found
    },

    /**
     * Determine whether the specified tenant is active (i.e., not retired).
     *
     * @param {string} tenandId Tenant ID.
     * @return {boolean} True if tenant is active.
     */
    isTenantActive(tenantId) {
        if (!tenantId) {
            return false
        }
        let tenant = Tenants.findOne(tenantId, { fields: { dateRetired: 1 }})
        if (!tenant) {
            return false
        }
        return !tenant.dateRetired
    },

    /**
     * Determine whether the specified domain is active (i.e., not retired).
     * This is a compound condition that takes into account the state of the tenant.
     *
     * @param {string} domainId Domain ID.
     * @return {boolean} True if both domain and tenant are active.
     */
    isDomainActive(domainId) {
        if (!domainId) {
            return false
        }
        let domain = Domains.findOne(domainId, { fields: { tenant: 1, dateRetired: 1 }})
        if (!domain) {
            return false
        }
        return Util.isTenantActive(domain.tenant) && !domain.dateRetired
    },

    /**
     * Given a domain ID return the tenant ID.
     *
     * @param {string} domainId Domain ID.
     * @return {string} Tenant ID.
     */
    getTenantId(domainId) {
        let domain = Domains.findOne(domainId, { fields: { tenant: 1 } })
        if (!domain) {
            //OLog.error("util.js getTenantId unable to find domainId="+domainId)
            return
        }

        return domain.tenant
    },

    /**
     * Given a role and a domain ID, return either the domain ID unchanged
     * or look up the tenant ID.
     *
     * @param {string} roleName Role name.
     * @param {string} domainId Domain ID.
     * @return {string} Tenant or domain ID.
     */
    getTenantOrDomainId(roleName, domainId) {
        if (!Util.isTenantRole(roleName)) {
            return domainId
        }
        let domain = Domains.findOne(domainId, { fields: { tenant: 1 } })
        if (!domain) {
            OLog.error("util.js getTenantOrDomainId cannot find domainId=" + domainId)
            return
        }
        return domain.tenant
    },

    /**
     * Get tenant ID from a field path.
     *
     * @param {object} user User record.
     * @param {string} path Field path (e.g., "profile.tenants.3.tenantId").
     * @param {boolean} tenant True to retrieve tenant otherwise retrieve domain.
     * @return {string} Tenant ID.
     */
    getTenantIdFromPath(user, path, tenant) {
        let index = Util.getIndexFromPath(path, 2)
        if (tenant) {
            if (index >= user.profile.tenants.length) {
                return
            }
            let tenantId = user.profile.tenants[index].tenantId
            OLog.debug("vxapp.js getTenantIdFromPath userId=" + user._id + " path=" + path + " index=" + index + " tenant=" + tenantId)
            return tenantId
        }
        if (index >= user.profile.domains.length) {
            return
        }
        let domainId = user.profile.domains[index].domainId
        let tenantId = Util.getTenantId(domainId)
        OLog.debug("vxapp.js getTenantIdFromPath userId=" + user._id + " path=" + path + " index=" + index + " domainId=" + domainId + " tenant=" + tenantId)
        return tenantId
    },

    /**
     * Extract an index value from a field path.
     *
     * @param {string} path Field path (e.g., "profile.tenants.3.tenantId").
     * @param {number} partIndex Index of part (segment) that contains index to get.
     * @return {number} Parsed integer number,
     */
    getIndexFromPath(path, partIndex) {
        try {
            return parseInt(path.split(".")[partIndex])
        }
        catch (error) {
            OLog.error("vxapp.js getIndexFromPath error occurred attempting to split schema path=" + path + " partIndex=" + partIndex + " error=" + error)
            return
        }
    },

    /**
     * Count the tenant administrators in the specified tenant.
     *
     * @param {string} includeRetiredUsers True to include retired users.
     * @param {string} includeRetiredDomains True to include retired domains.
     * @param {string} domainIdIgnore Optional domain ID to be ignored.
     * @return {number} Count of system administrators in tenant.
     */
    countTenantAdmin(tenantId, includeRetiredUsers, includeRetiredDomains, domainIdIgnore) {
        let userArray = Util.findUsersInTenant(tenantId, includeRetiredUsers, includeRetiredDomains, domainIdIgnore)
        let count = 0
        userArray.forEach(user => {
            if (Util.isUserTenantAdmin(user._id, tenantId)) {
                count++
            }
        })
        return count
    },

    /**
     * Find the non-retired users in the specified tenant.
     *
     * @param {string} tenantId Tenant ID.
     * @param {string} includeRetiredUsers True to include retired users.
     * @param {string} includeRetiredDomains True to include inactive domains.
     * @param {string} domainIdIgnore Optional domain ID to be ignored.
     * @return {array} Cursor of users in the tenant.
     */
    findUsersInTenant(tenantId, includeRetiredUsers, includeRetiredDomains, domainIdIgnore) {
        let domainIds = Util.getDomainIdsOfTenant(tenantId, includeRetiredDomains)
        if (domainIdIgnore) {
            domainIds = _.without(domainIds, domainIdIgnore)
        }
        let criteria = {}
        criteria["profile.domains"] = { $elemMatch: { domainId: { $in: domainIds } } }
        if (!includeRetiredUsers) {
            criteria["profile.dateRetired"] = { $exists:false }
        }
        return Meteor.users.find(criteria).fetch()
    },

    /**
     * Find the list of users within a specified domain.
     *
     * @param {object} domainId Domain ID.
     * @param {string} includeRetiredUsers True to include retired users.
     * @return {object} Cursor of users in domain.
     */
    findUsersInDomain(domainId, includeRetiredUsers) {
        let criteria = {}
        criteria["profile.domains"] = { $elemMatch: { domainId: domainId } }
        if (!includeRetiredUsers) {
            criteria["profile.dateRetired"] = { $exists : false }
        }
        return Meteor.users.find(criteria)
    },

    /**
     * Return the domain IDs of the specified tenant.
     *
     * @param {string} tenantId Tenant ID.
     * @param {string} includeRetiredDomains True to include retired domains.
     * @return {array} Array of domain IDs.
     */
    getDomainIdsOfTenant(tenantId, includeRetiredDomains) {
        let selector = {}
        selector.tenant = tenantId
        if (!includeRetiredDomains) {
            selector.dateRetired = { $exists: false }
        }
        let domains = Domains.find(selector, { fields : { _id: 1 } }).fetch()
        return _.pluck(domains, "_id")
    },

    /**
     * Make a list of event type objects suitable for the user profile view.
     *
     * @return {array} Array of event type objects.
     */
    makeEventTypeObjects() {
        let eventTypes = []
        for (let eventType in Meteor.i18nMessages.codes.eventType) {
            if (!Util.isNotificationEventType(eventType)) {
                continue
            }
            let eventTypeTemp = Meteor.i18nMessages.codes.eventType[eventType]
            let eventTypeObject = {}
            eventTypeObject.eventType = eventType
            eventTypeObject.description = Util.i18n("codes.eventType." + eventType)
            eventTypeObject.roles = eventTypeTemp.roles
            eventTypes.push(eventTypeObject)
        }
        return eventTypes
    },

    /**
     * Determine whether this event type qualifies for inclusion in the list of notifications.
     *
     * @param {string} Event type (e.g., CARD_SLOWPACE).
     * @return {boolean} True if event type should appear in profile list.
     */
    isNotificationEventType(eventType) {
        let eventTypeObject = Meteor.i18nMessages.codes.eventType[eventType]
        // If this row has no notifications associated with it, skip it:
        if (!eventTypeObject.hasOwnProperty("notification")) {
            return false
        }
        return true
    },

    /**
     * Return the list of authorized preference definitions filtered by available role.
     *
     * @param {object} user User to test.
     * @return {array} Array of preference definition objects.
     */
    makePreferenceDefinitionObjects(user) {
        let preferenceDefinitions = []
        for (let preferenceDefinition in Meteor.i18nMessages.codes.preferenceDefinition) {
            let preferenceDefinitionValue = Meteor.i18nMessages.codes.preferenceDefinition[preferenceDefinition]
            if (preferenceDefinitionValue.roles) {
                let roleFound
                preferenceDefinitionValue.roles.every(roleName => {
                    if (Util.isUserRole(user._id, roleName)) {
                        roleFound = true
                        return false
                    }
                    return true
                })
                if (!roleFound) {
                    continue
                }
            }
            let preferenceDefinitionObject = {}
            preferenceDefinitionObject.preferenceDefinition = preferenceDefinition
            preferenceDefinitionObject.description = Util.i18n("codes.preferenceDefinition." + preferenceDefinition)
            preferenceDefinitions.push(preferenceDefinitionObject)
        }
        return preferenceDefinitions
    },

    /**
     * Return the list of authorized report definitions filtered by available role.
     *
     * @param {object} user User to test.
     * @return {array} Array of report definition objects.
     */
    makeReportDefinitionObjects(user) {
        let reportDefinitionObjects = []
        for (let reportType in Meteor.i18nMessages.codes.reportType) {
            if (!Util.isAuthorizedReportType(user, reportType)) {
                continue
            }
            let reportDefinitionObject = {}
            reportDefinitionObject.reportType = reportType
            reportDefinitionObject.description = Util.i18n("codes.reportType." + reportType)
            reportDefinitionObjects.push(reportDefinitionObject)
        }
        return reportDefinitionObjects
    },

    /**
     * Fetch a preference value from a given user record.
     *
     * @param {object} user User record.
     * @param {string} preferenceDefinition Preference definition to retrieve.
     * @param {?} Value of preference.
     */
    fetchStandardPreferenceValue(user, preferenceDefinition) {
        let standardPreference = _.findWhere(user.profile.standardPreferences, { preferenceDefinition : preferenceDefinition })
        if (!standardPreference) {
            return
        }
        return standardPreference.preferenceValue
    },

    /**
     * Fetch a preference value from a given user record.
     *
     * @param {object} user User record.
     * @param {string} reportType Report type.
     * @param {string} name Field name.
     * @param {?} Value of preference.
     */
    fetchReportPreferenceValue(user, reportType, name) {
        let reportPreference = _.findWhere(user.profile.reportPreferences, { reportType : reportType })
        if (!reportPreference) {
            return
        }
        return reportPreference[name]
    },

    /**
     * Determine whether this report type qualifies for inclusion in the list of reports.

     * @param {object} user User record.
     * @param {string} reportType Report type (e.g., TEAM_STATUS).
     * @return {boolean} True if report type should appear in profile list.
     */
    isAuthorizedReportType(user, reportType) {
        let reportTypeObject = Meteor.i18nMessages.codes.reportType[reportType]
        // If this row is not available to the current user based on his role, skip it:
        if (reportTypeObject.role && !Util.isUserRole(user._id, reportTypeObject.role)) {
            return false
        }
        return true
    },

    /**
     * Make an array of time options appropriate for a given time unit.
     *
     * @param {string} timeUnit Time unit.
     * @return {array} Array of time options.
     */
    makeTimeOptionsArray(timeUnit) {
        timeUnit = timeUnit || "HOUR"
        let timeOptions = Meteor.i18nMessages.codes.timeUnit[timeUnit].timeOptions
        return timeOptions.map(timeOption => {
            let propertyLocalized = Util.i18n("codes.timeOption." + timeOption)
            return { code: timeOption, localized: propertyLocalized }
        })
    },

    /**
     * Determine whether a given report type has parameter definitions.
     *
     * @param {string} reportType Report type.
     * @return {boolean} True if the report type has parameter definitions.
     */
    isReportParameterDefinitions(reportType) {
        return !!Util.reportParameterDefinitions(reportType)
    },

    /**
     * Return the parameter definitions of a given report type.
     *
     * @param {string} reportType Report type.
     * @return {object} Parameter definitions object or undefined if no parameters.
     */
    reportParameterDefinitions(reportType) {
        let reportTypeObject = Meteor.i18nMessages.codes.reportType[reportType]
        if (!reportTypeObject) {
            OLog.error("util.js reportParameterDefinitions could not find reportType=" + reportType)
            return
        }
        if (!reportTypeObject.parameterDefinitions) {
            return
        }
        return _.map(reportTypeObject.parameterDefinitions, (reportParameterDefinition, fieldName) => {
            reportParameterDefinition.fieldName = fieldName
            reportParameterDefinition.fieldNameLocalized = Util.i18n("codes.reportType." + reportType + ".parameterDefinitions." + fieldName)
            return reportParameterDefinition
        })
    },

    /**
     * Create an object consisting of the default values for parameter fields.
     *
     * @param {string} reportType Report type.
     * @param {?} userOrId User record or ID.
     * @return {object} Report default parameters object or undefined if no parameters.
     */
    reportParameterDefaults(reportType, userOrId) {
        let reportParameterDefinitions = Util.reportParameterDefinitions(reportType)
        if (!reportParameterDefinitions) {
            return
        }
        let user = Util.user(userOrId)
        let timezone = Util.reportTimezone(reportType, user)
        let reportParameterDefaults = {}
        _.each(reportParameterDefinitions, (reportParameterDefinition) => {
            switch (reportParameterDefinition.type) {
            case "DATE" : {
                switch (reportParameterDefinition.default) {
                case "START_OF_MONTH" : {
                    reportParameterDefaults[reportParameterDefinition.fieldName] = moment().tz(timezone).startOf("month").toDate()
                    break
                }
                case "END_OF_MONTH" : {
                    reportParameterDefaults[reportParameterDefinition.fieldName] = moment().tz(timezone).endOf("month").toDate()
                    break
                }
                }
            }
            }
        })

        return reportParameterDefaults
    },

    /**
     * Get the effective timezone for a specified report.
     *
     * @param {string} reportType Report type.
     * @param {string} userOrId User object or ID.
     * @return {string} Timezone in IANA form.
     */
    reportTimezone(reportType, userOrId) {
        let reportTypeObject = Meteor.i18nMessages.codes.reportType[reportType]
        if (!reportTypeObject) {
            OLog.error("util.js reportTimezone could not find reportType=" + reportType)
            return
        }
        return reportTypeObject.timezone || Util.getUserTimezone(userOrId)
    },

    /**
     * Get the configuration for a specified report.
     *
     * @param {string} reportType Report type.
     * @return {object} Configuration object for report.
     */
    reportConfig(reportType) {
        let reportTypeObject = Meteor.i18nMessages.codes.reportType[reportType]
        if (!reportTypeObject) {
            OLog.error("util.js reportConfig could not find reportType=" + reportType)
            return
        }
        return reportTypeObject.config
    },

    /**
     * Format the report description including the next execution date.
     *
     * @param {string} reportType Report type.
     * @param {string} user User record.
     */
    formatReportDescription(reportType, user) {
        let description = Util.i18n("codes.reportType." + reportType)
        let nextDate = Util.fetchReportPreferenceValue(user, reportType, "nextDate")
        if (nextDate) {
            let nextMoment = moment.tz(nextDate, user.profile.timezone)
            description += " " + Util.i18n("profile.format_next_date", { nextDate: nextMoment.format("D MMM YYYY h:mm A") } )
        }
        return description
    },

    /**
     * Send an email report.
     *
     * @param {string} reportType Report type.
     * @param {object} reportParameters Report parameters (either values or defaults).
     */
    sendReport(reportType, reportParameters) {
        Meteor.call("sendReport", Meteor.userId(), reportType, reportParameters, (error, result) => {
            UX.notify(result, error)
        })
    },

    /**
     * Extract report parameters from UI and return them in object form.
     *
     * @param {string} reportType Report type.
     * @return {object} Report parameter values object.
     */
    reportParameterValues(reportType) {
        let reportParameterDefinitions = Util.reportParameterDefinitions(reportType)
        let timezone = Util.reportTimezone(reportType, Meteor.userId())
        let reportParameterValues = {}
        _.each(reportParameterDefinitions, reportParameterDefinition => {
            let component = UX.findComponentById(reportParameterDefinition.fieldName)
            if (!component) {
                OLog.error("util.js reportParameterValues unable to find component for fieldName=" + reportParameterDefinition.fieldName)
                return
            }
            switch (reportParameterDefinition.type) {
            case "DATE":
                switch (reportParameterDefinition.subtype) {
                case "START_OF_DAY":
                    reportParameterValues[reportParameterDefinition.fieldName] =
                        moment.tz(component.getValue(), timezone).startOf("day").toDate()
                    break
                case "END_OF_DAY":
                    reportParameterValues[reportParameterDefinition.fieldName] =
                        moment.tz(component.getValue(), timezone).endOf("day").toDate()
                    break
                }
                break
            default :
                reportParameterValues[reportParameterDefinition.fieldName] = component.getValue()
                break
            }
        })
        return reportParameterValues
    },

    /**
     * Convenience method to always return user record given either user record
     * or user ID.
     *
     * @param {?} userOrId User object or ID.
     * @return {object} User record.
     */
    user(userOrId) {
        if (_.isObject(userOrId)) {
            return userOrId
        }
        let user = Util.fetchUserLimited(userOrId)
        if (!user) {
            OLog.error("util.js user unable to find userOrId=" + userOrId)
            return
        }
        return user
    },

    /**
     * Null-safe to string function.
     *
     * @param {?} value Value (typically string or number).
     * @return {string} String or null.
     */
    toString(value) {
        if (!value) {
            return value
        }
        return value.toString()
    },

    /**
     * Mutate an array by removing any trailing rows where all of the properties
     * have null values.
     *
     * @param {array} array Array of objects.
     * @param {array} ignoreKeys Array of names of keys to ignore.
     * @return {array} Array with empty rows removed.
     */
    removeEmptyRows(array, ignoreKeys) {
        for (let rowIndex = array.length - 1; rowIndex >= 0; rowIndex--) {
            let row = array[rowIndex]
            let rowInUse = false
            _.every(Object.keys(row), key => {
                if (_.contains(ignoreKeys, key)) {
                    return true
                }
                if (!Util.isNullish(row[key])) {
                    rowInUse = true
                    return false
                }
                return true
            })
            if (rowInUse) {
                break
            }
            array.splice(rowIndex, 1)
        }
        return array
    },

    /**
     * Deep clone object.
     *
     * @param {object} input Input object.
     * @return {object} Cloned object.
     */
    clone(input) {
        return EJSON.parse(EJSON.stringify(input))
    },

    /**
     * Deep compare objects.
     *
     * @param {object} objectOne Input object.
     * @param {object} objectTwo Input object.
     * @return {boolean} True if objects are deeply equivalent.
     */
    deepCompare(objectOne, objectTwo) {
        const objectOneString = EJSON.stringify(objectOne)
        const objectTwoString = EJSON.stringify(objectTwo)
        return objectOneString === objectTwoString
    },

    /**
     * Return Meteor collection matching supplied name.
     *
     * @param {string} collectionName Collection name (typically lowercase like "domains")
     * @return {object} Reference to collection.
     */
    getCollection(collectionName) {
        return Mongo.Collection.get(collectionName)
    },

    /**
     * Convert a object traversal path from lodash "get" form to a MongoDB modifier path.
     * Example: coverages[0].options -> coverages.0.options
     *
     * @param {string} lodashPath Input path in lodash "get" form.
     * @return {string} Path suitable for MongoDB $set or $pull modifier.
     */
    toMongoPath(lodashPath) {
        return lodashPath.replaceAll("[", ".").replaceAll("]", "")
    },

    /**
     * Given an array of objects, return the index of an object that has an id field matching a supplied value.
     *
     * @param {array} array Array of objects.
     * @param {string} name Name of ID property.
     * @param {string} value Value of ID property.
     * @return {number} Index of object.
     */
    indexOf(array, name, value) {
        const ids = _.pluck(array, name)
        return ids.indexOf(value)
    }
}
