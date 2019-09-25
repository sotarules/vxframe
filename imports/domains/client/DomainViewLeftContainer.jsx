import { withTracker } from "meteor/react-meteor-data"
import DomainViewLeft from "/imports/domains/client/DomainViewLeft"

export default withTracker(( ) => {

    let domains, currentDomainId

    domains = VXApp.findDomainList()
    currentDomainId = Util.getCurrentDomainId(Meteor.userId())

    return {
        domains,
        currentDomainId
    }

})(DomainViewLeft)
