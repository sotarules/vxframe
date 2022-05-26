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
    strip(input, country) {
        if (!input) {
            return null
        }
        country = country || "US"
        if (country !== "US") {
            return input
        }
        input = input.toUpperCase()
        const inputArray = input.split("X")
        const phone = inputArray[0]
        const extension = inputArray.length > 1 ? inputArray[1] : null
        let phoneStripped = phone ?
            phone.trim().replace(CX.REGEX_NUMERIC_STRIP1, CX.REGEX_NUMERIC_STRIP2) : null
        let extensionStripped = extension ?
            extension.trim().replace(CX.REGEX_NUMERIC_STRIP1, CX.REGEX_NUMERIC_STRIP2) : null
        if (phoneStripped?.indexOf("1") === 0) {
            phoneStripped = phoneStripped.substring(1)
        }
        return phoneStripped + (extension ? `X${extensionStripped}` : "")
    },
    render(input, country) {
        if (!input) {
            return null
        }
        if (country !== "US") {
            return input
        }
        const inputArray = input.split("X")
        const phone = inputArray[0]
        const extension = inputArray.length > 1 ? inputArray[1] : null
        return phone.replace(CX.REGEX_PHONE_RENDER1, CX.REGEX_PHONE_RENDER2) +
            (extension ? ` X${extension}` : "")
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

FX.json = {
    strip(json) {
        if (Util.isNullish(json)) {
            return null
        }
        return json.trim()
    },
    render(json) {
        try {
            const jsonObject = JSON.parse(json)
            return JSON.stringify(jsonObject)
        }
        catch (e) {
            // Bury
        }
        return null
    }
}
