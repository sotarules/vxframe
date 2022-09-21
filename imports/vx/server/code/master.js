Future = require("fibers/future")
Excel = require("exceljs")
stream = require("stream")
Accounts.config({
    sendVerificationEmail : true,
    forbidClientAccountCreation : false,
    loginExpirationInDays: VXApp.loginExpirationInDays()
})
