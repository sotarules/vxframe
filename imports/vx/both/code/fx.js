"use strict";

FX.trim = {
    strip(external) {
        if (_.isString(external)) {
            return external.trim()
        }
        return external
    },
    render : function(internal) {
        return internal
    }
}

FX.integer = {
    strip(external) {
        if (Util.isInteger(external)) {
            return external.trim()
        }
        return external.trim().replace(CX.REGEX_NUMERIC_STRIP1, CX.REGEX_NUMERIC_STRIP2)
    },
    render(internal) {
        return internal
    }
}

FX.phoneUS = {
    strip(phone, country) {
        country = country || "US"
        if (!phone) {
            return null
        }
        let stripped = phone.trim().replace(CX.REGEX_NUMERIC_STRIP1, CX.REGEX_NUMERIC_STRIP2)
        if (country !== "US") {
            return stripped
        }
        // Drop the leading "1" if specified for country US:
        if (stripped.indexOf("1") === 0) {
            stripped = stripped.substring(1)
        }
        return stripped
    },
    render(phone, country) {
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
    strip(money) {
        if (Util.isNullish(money)) {
            return null
        }
        return money.trim().replace(CX.REGEX_DECIMAL_STRIP1, CX.REGEX_DECIMAL_STRIP2)
    },
    render(money) {
        if (Util.isNullish(money)) {
            return null
        }
        return Util.formatMoney(money)
    }
}

FX.creditCardNumber = {
    strip(creditCardNumber) {
        if (!creditCardNumber) {
            return null
        }
        return creditCardNumber.trim().replace(CX.REGEX_NUMERIC_STRIP1, CX.REGEX_NUMERIC_STRIP2)
    },
    render(creditCardNumber) {
        return Util.formatCreditCardNumber(creditCardNumber)
    }
}

FX.expirationDate = {
    strip(expirationDate) {
        if (!expirationDate) {
            return null
        }
        return expirationDate.trim().replace(CX.REGEX_NUMERIC_STRIP1, CX.REGEX_NUMERIC_STRIP2)
    },
    render(expirationDate) {
        return Util.formatExpirationDate(expirationDate)
    }
}

FX.balance = {
    strip(balance) {
        if (Util.isNullish(balance)) {
            return null
        }
        return balance.trim().replace(CX.REGEX_DECIMAL_STRIP1, CX.REGEX_DECIMAL_STRIP2)
    },
    render(balance) {
        if (Util.isNullish(balance)) {
            return null
        }
        return Util.formatMoney(balance)
    }
}
