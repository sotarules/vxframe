import { connect } from "react-redux"
import { withTracker } from "meteor/react-meteor-data"
import TenantViewRight from "/imports/tenants/client/TenantViewRight"

const MeteorContainer = withTracker(( ) => {

    let tenant, decorationIconClassName, decorationColor, decorationTooltip, userEmail, isUserTenantAdmin, domains, domainRolesChecked, currentDomainId
    tenant = ContextMaker.tenants()
    if (tenant) {
        decorationIconClassName = Util.isTenantCurrent(tenant._id) ? "entity-decoration-icon-medium fa fa-lg fa-asterisk" : null
        decorationColor = "blue"
        decorationTooltip = Util.i18n("common.tooltip_tenant_decoration_current")
        userEmail = Util.getUserEmail(Meteor.userId())
        isUserTenantAdmin =  Util.isUserTenantAdmin(Meteor.userId(), tenant._id)
        domains = Util.findDomainsInTenant(Meteor.userId(), tenant._id, false)
        domainRolesChecked = Util.domainRolesMap(domains, Meteor.userId())
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
        currentDomainId,
        domainRolesChecked
    }

})(TenantViewRight)

const mapStateToProps = state => {
    return {
        publishCurrentTenant : state.publishCurrentTenant
    }
}

export default connect(
    mapStateToProps
)(MeteorContainer)
