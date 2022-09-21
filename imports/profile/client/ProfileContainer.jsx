import { withTracker } from "meteor/react-meteor-data"
import Profile from "/imports/profile/client/Profile"

export default withTracker(() => {
    const user = Util.fetchUserLimited(Meteor.userId())
    return {
        user,
        states : UX.makeCodeArray("state"),
        countries : UX.makeCodeArray("country"),
        locales :  UX.makeCodeArray("locale"),
        timezones : UX.makeTimezoneArray(),
        eventTypeObjects : Util.makeEventTypeObjects(),
        preferenceDefinitionObjects : Util.makePreferenceDefinitionObjects(user),
        reportDefinitionObjects : Util.makeReportDefinitionObjects(user),
        reports : VXApp.makeReportArray()
    }
})(Profile)
