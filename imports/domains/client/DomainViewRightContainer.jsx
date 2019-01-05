import { connect } from "react-redux"
import { withTracker } from "meteor/react-meteor-data"
import DomainViewRight from "/imports/domains/client/DomainViewRight"

const MeteorContainer = withTracker(( ) => {

    let tenant = ContextMaker.domains()
    if (!(tenant && tenant.domain)) {
        return {}
    }

    let domain = tenant.domain

    return {
        domain : domain,
        decorationIconClassName : Util.isDomainCurrent(domain._id) ? "entity-decoration-icon-medium fa fa-lg fa-asterisk" : null,
        decorationColor : "blue",
        decorationTooltip : Util.i18n("common.tooltip_domain_decoration_current"),
        users : Util.findUsersInDomain(domain._id).fetch(),
        currentDomainId : Util.getCurrentDomainId(Meteor.userId())
    }

})(DomainViewRight)

const mapStateToProps = state => {
    return {
        publishCurrentTenant : state.publishCurrentTenant,
        publishCurrentDomain : state.publishCurrentDomain
    }
}

export default connect(
    mapStateToProps
)(MeteorContainer)
