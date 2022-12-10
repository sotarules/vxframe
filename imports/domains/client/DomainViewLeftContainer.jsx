import { withTracker } from "meteor/react-meteor-data"
import DomainViewLeft from "/imports/domains/client/DomainViewLeft"

export default withTracker(( ) => {
    const tenantId = VXApp.criteriaId(Store.getState().publishCurrentTenant)
    const domains = Util.findUserDomainsInTenant(Meteor.userId(), tenantId, false)
    const currentDomainId = Util.getCurrentDomainId()
    return {
        domains,
        currentDomainId
    }
})(DomainViewLeft)
