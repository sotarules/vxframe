import { withTracker } from "meteor/react-meteor-data"
import TopBarSubsystemStatusLights from "/imports/layout/client/TopBarSubsystemStatusLights.jsx"

export default withTracker(( ) => {
    let domain = Domains.findOne(Util.getCurrentDomainId(Meteor.userId()))
    let subsystemStatus = domain && domain.subsystemStatus ? domain.subsystemStatus : []
    return {
        subsystemStatus : subsystemStatus
    }
})(TopBarSubsystemStatusLights)
