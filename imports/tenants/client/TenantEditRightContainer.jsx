import { withTracker } from "meteor/react-meteor-data"
import TenantEditRight from "/imports/tenants/client/TenantEditRight"

export default withTracker(( ) => {

    let tenant, decorationIconClassName, decorationColor, decorationTooltip, userEmail, isUserTenantAdmin, domains, currentDomainId
    tenant = ContextMaker.tenant()
    if (tenant) {
        decorationIconClassName = Util.isTenantCurrent(tenant._id) ? "entity-decoration-icon-medium fa fa-lg fa-asterisk" : null
        decorationColor = "blue"
        decorationTooltip = Util.i18n("common.tooltip_tenant_decoration_current")
        userEmail = Util.getUserEmail(Meteor.userId())
        isUserTenantAdmin =  Util.isUserTenantAdmin(Meteor.userId(), tenant._id)
        domains = Util.findDomainsInTenant(Meteor.userId(), tenant._id, false)
        currentDomainId = Util.getCurrentDomainId(Meteor.userId())
    }

    return {
        tenant,
        decorationIconClassName,
        decorationColor,
        decorationTooltip,
        userEmail,
        isUserTenantAdmin,
        domains,
        currentDomainId
    }

})(TenantEditRight)

