/*
 * Set up MongoDB indexes.
 */
Meteor.startup(() => {

    console.log("indexes.js (vx) ensuring presence of MongoDB indexes")

    Log._ensureIndex({ domain : 1})
    Log._ensureIndex({ date : 1 })
    Log._ensureIndex({ date : 1, hrtime : 1 })

    Events._ensureIndex({ domain : 1 })
    Events._ensureIndex({ type : 1 })
    Events._ensureIndex({ date : 1 })
    Events._ensureIndex({ type : 1, domain : 1, "eventData.userId" : 1, date : 1, })

    Notifications._ensureIndex({ domain : 1 })
    Notifications._ensureIndex({ date : 1 })
    Notifications._ensureIndex({ PNOTIFY_processed : 1 })
    Notifications._ensureIndex({ EMAIL_processed : 1 })
    Notifications._ensureIndex({ SMS_processed : 1 })
    Notifications._ensureIndex({ SMS_messageSid : 1 })

    Templates._ensureIndex({ domain : 1})
    Functions._ensureIndex({ domain : 1})

    console.log("indexes.js (vx) indexes have been ensured")
})
