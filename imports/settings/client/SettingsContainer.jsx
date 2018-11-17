import { withTracker } from "meteor/react-meteor-data"
import Settings from "/imports/settings/client/Settings.jsx"

export default withTracker(() => {

    return {
        user : Util.fetchUserLimited(Meteor.userId()),
        config : Config.findOne("1"),
        tenant : Tenants.findOne(Util.getCurrentTenantId(Meteor.userId())),
        domain : Domains.findOne(Util.getCurrentDomainId(Meteor.userId())),
        logLevels : UX.makeLogLevelsArray(false, true),
        campaignUnits : UX.makeCodeArray("campaignUnit"),
        admins : UX.makeUserArray("TENANTADMIN"),
        states : UX.makeCodeArray("state"),
        countries : UX.makeCodeArray("country")
    }

})(Settings)
