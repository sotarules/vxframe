import { connect } from "react-redux"
import { withTracker } from "meteor/react-meteor-data"
import DomainUserViewRight from "/imports/usersdomains/client/DomainUserViewRight"

const MeteorContainer = withTracker(() => {

    let domain, decorationIconClassName, decorationColor, decorationTooltip, userRolesChecked, users
    domain = ContextMaker["domains-users"]()
    if (domain) {
        users = VXApp.findDomainUserList(domain)
        decorationIconClassName = Util.isDomainCurrent(domain._id) ? "entity-decoration-icon-medium fa fa-lg fa-asterisk" : null
        decorationColor = "blue"
        decorationTooltip = Util.i18n("common.tooltip_domain_decoration_current")
        userRolesChecked = Util.userRolesMap(users, domain)
        users = VXApp.findDomainUserList(domain)
    }

    return {
        domain,
        decorationIconClassName,
        decorationColor,
        decorationTooltip,
        users,
        userRolesChecked,
    }

})(DomainUserViewRight)

const mapStateToProps = state => {
    return {
        publishAuthoringDomain : state.publishAuthoringDomain
    }
}

export default connect(
    mapStateToProps
)(MeteorContainer)
