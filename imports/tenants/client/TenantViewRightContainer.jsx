import { withTracker } from "meteor/react-meteor-data"
import TenantViewRight from "/imports/tenants/client/TenantViewRight.jsx"

export default withTracker(( ) => {

    let tenant = ContextMaker.tenants()
    if (!tenant) {
        return {}
    }

    let domains = Util.findDomainsInTenant(Meteor.userId(), tenant._id, false)

    return {
        tenant : tenant,
        decorationIconClassName : Util.isTenantCurrent(tenant._id) ? "entity-decoration-icon-medium fa fa-lg fa-asterisk" : null,
        decorationColor : "blue",
        decorationTooltip : Util.i18n("common.tooltip_tenant_decoration_current"),
        userEmail : Util.getUserEmail(Meteor.userId()),
        isUserTenantAdmin :  Util.isUserTenantAdmin(Meteor.userId(), tenant._id),
        domains : domains,
        domainRolesChecked : Util.domainRolesMap(domains, Meteor.userId()),
        currentDomainId : Util.getCurrentDomainId(Meteor.userId())
    }

})(TenantViewRight)

