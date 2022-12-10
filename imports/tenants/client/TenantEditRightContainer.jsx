import { withTracker } from "meteor/react-meteor-data"
import TenantEditRight from "/imports/tenants/client/TenantEditRight"
import {connect} from "react-redux"

const MeteorContainer = withTracker(( ) => {
    let tenant, decorationIconClassName, decorationColor, decorationTooltip, domains, currentDomainId
    tenant = ContextMaker.tenant()
    if (tenant) {
        decorationIconClassName = Util.isTenantCurrent(tenant._id) ? "entity-decoration-icon-medium fa fa-lg fa-asterisk" : null
        decorationColor = "blue"
        decorationTooltip = Util.i18n("common.tooltip_tenant_decoration_current")
        domains = Util.findUserDomainsInTenant(Meteor.userId(), tenant._id, false)
        currentDomainId = Util.getCurrentDomainId()
    }
    return {
        tenant,
        decorationIconClassName,
        decorationColor,
        decorationTooltip,
        domains,
        currentDomainId
    }
})(TenantEditRight)

const mapStateToProps = state => {
    return {
        publishCurrentTenant : state.publishCurrentTenant,
    }
}

export default connect(
    mapStateToProps
)(MeteorContainer)
