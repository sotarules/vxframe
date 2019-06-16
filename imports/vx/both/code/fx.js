"use strict";

FX.trim = {

    strip : function(external) {

        if (_.isString(external)) {
            return external.trim()
        }

        return external
    },

    render : function(internal) {
        return internal
    }
}

FX.phoneUS = {

    strip : function(phone, country) {

        var stripped

        if (!phone) {
            return null
        }

        stripped = phone.trim().replace(CX.REGEX_NUMERIC_STRIP1, CX.REGEX_NUMERIC_STRIP2)

        if (country !== "US") {
            return stripped
        }

        // Drop the leading "1" if specified for country US:
        if (stripped.indexOf("1") === 0) {
            stripped = stripped.substring(1)
        }

        return stripped
    },

    render : function(phone, country) {

        if (!phone) {
            return null
        }

        if (country !== "US") {
            return phone
        }

        return phone.replace(CX.REGEX_PHONE_RENDER1, CX.REGEX_PHONE_RENDER2)
    }
}

FX.money = {

    strip : function(money) {

        if (Util.isNullish(money)) {
            return null
        }

        return money.trim().replace(CX.REGEX_DECIMAL_STRIP1, CX.REGEX_DECIMAL_STRIP2)
    },

    render : function(money) {

        if (Util.isNullish(money)) {
            return null
        }

        return Util.formatMoney(money)
    }
}

FX.creditCardNumber = {

    strip : function(creditCardNumber) {

        if (!creditCardNumber) {
            return null
        }

        return creditCardNumber.trim().replace(CX.REGEX_NUMERIC_STRIP1, CX.REGEX_NUMERIC_STRIP2)
    },

    render : function(creditCardNumber) {
        return Util.formatCreditCardNumber(creditCardNumber)
    }
}

FX.expirationDate = {

    strip : function(expirationDate) {

        if (!expirationDate) {
            return null
        }

        return expirationDate.trim().replace(CX.REGEX_NUMERIC_STRIP1, CX.REGEX_NUMERIC_STRIP2)
    },

    render : function(expirationDate) {
        return Util.formatExpirationDate(expirationDate)
    }
}

FX.balance = {

    strip : function(balance) {

        if (Util.isNullish(balance)) {
            return null
        }

        return balance.trim().replace(CX.REGEX_DECIMAL_STRIP1, CX.REGEX_DECIMAL_STRIP2)
    },

    render : function(balance) {

        if (Util.isNullish(balance)) {
            return null
        }

        return Util.formatMoney(balance)
    }
}

