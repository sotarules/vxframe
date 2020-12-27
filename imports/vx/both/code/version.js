import { version } from "/package.json"

/**
 * Application version and date.
 */
Meteor.appVersion = {
    version: version,
    buildDate: new Date("2020-12-27T15:03:00-08:00")
}
