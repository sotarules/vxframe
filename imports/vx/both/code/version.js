import { version, buildDate } from "/package.json"

/**
 * Pull application version and build date from package.json.
 */
Meteor.appVersion = {
    version: version,
    buildDate: new Date(buildDate)
}
