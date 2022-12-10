import { connect } from "react-redux"
import { withTracker } from "meteor/react-meteor-data"
import TenantViewRight from "/imports/tenants/client/TenantViewRight"

const MeteorContainer = withTracker(( ) => {
    let tenant, decorationIconClassName, decorationColor, decorationTooltip, domains, domainRolesChecked, currentDomainId
    tenant = ContextMaker.tenants()
    if (tenant) {
        decorationIconClassName = Util.isTenantCurrent(tenant._id) ? "entity-decoration-icon-medium fa fa-lg fa-asterisk" : null
        decorationColor = "blue"
        decorationTooltip = Util.i18n("common.tooltip_tenant_decoration_current")
        domains = Util.findUserDomainsInTenant(Meteor.userId(), tenant._id, false)
        domainRolesChecked = Util.domainRolesMap(domains, Meteor.userId())
        currentDomainId = Util.getCurrentDomainId()
    }
    return {
        tenant,
        decorationIconClassName,
        decorationColor,
        decorationTooltip,
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
