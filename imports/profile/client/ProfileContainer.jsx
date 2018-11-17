import { withTracker } from "meteor/react-meteor-data"
import Profile from "/imports/profile/client/Profile.jsx"

export default withTracker(() => {

    Session.set("PUBLISH_CURRENT_USER", { criteria : { _id : Meteor.userId() } })

    let user = Util.fetchUserLimited(Meteor.userId())

    return {
        user : user,
        states : UX.makeCodeArray("state"),
        countries : UX.makeCodeArray("country"),
        locales :  UX.makeCodeArray("locale"),
        timezones : UX.makeTimezoneArray(),
        reportFrequencies : UX.makeCodeArray("reportFrequency"),
        timeUnits : UX.makeCodeArray("timeUnit"),
        eventTypeObjects : Util.makeEventTypeObjects(),
        preferenceDefinitionObjects : Util.makePreferenceDefinitionObjects(user),
        reportDefinitionObjects : Util.makeReportDefinitionObjects(user)
    }

})(Profile)
