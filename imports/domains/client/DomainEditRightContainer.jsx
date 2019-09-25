import { withTracker } from "meteor/react-meteor-data"
import DomainEditRight from "/imports/domains/client/DomainEditRight"

export default withTracker(( ) => {

    let domain, decorationIconClassName, decorationColor, decorationTooltip, userRolesChecked, users, states
    domain = ContextMaker.domain()
    if (domain) {
        users = VXApp.findDomainUserList(domain)
        decorationIconClassName = Util.isDomainCurrent(domain._id) ? "entity-decoration-icon-medium fa fa-lg fa-asterisk" : null
        decorationColor = "blue"
        decorationTooltip = Util.i18n("common.tooltip_domain_decoration_current")
        userRolesChecked = Util.userRolesMap(users, domain)
        users = VXApp.findDomainUserList(domain)
        states = UX.makeCodeArray("state")
    }

    return {
        domain,
        decorationIconClassName,
        decorationColor,
        decorationTooltip,
        users,
        userRolesChecked,
        states
    }

})(DomainEditRight)

