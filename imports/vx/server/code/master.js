Future = require("fibers/future")
Accounts.config({
    sendVerificationEmail : true,
    forbidClientAccountCreation : false,
    loginExpirationInDays: VXApp.loginExpirationInDays()
})
