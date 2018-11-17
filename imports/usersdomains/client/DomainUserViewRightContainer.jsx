import { withTracker } from "meteor/react-meteor-data"
import DomainUserViewRight from "/imports/usersdomains/client/DomainUserViewRight.jsx"

export default withTracker(() => {

    let domain = ContextMaker["domains-users"]()
    if (!domain) {
        return {}
    }

    let users = VXApp.findDomainUserList(domain)
    let userRolesChecked = Util.userRolesMap(users, domain)

    return {
        domain : domain,
        decorationIconClassName : Util.isDomainCurrent(domain._id) ? "entity-decoration-icon-medium fa fa-lg fa-asterisk" : null,
        decorationColor : "blue",
        decorationTooltip : Util.i18n("common.tooltip_domain_decoration_current"),
        users : VXApp.findDomainUserList(domain),
        userRolesChecked : userRolesChecked
    }

})(DomainUserViewRight)
