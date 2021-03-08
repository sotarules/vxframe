import { withTracker } from "meteor/react-meteor-data"
import DomainEditRight from "/imports/domains/client/DomainEditRight"

export default withTracker(( ) => {

    let domain, users, domainUsers, decorationIconClassName, decorationColor, decorationTooltip, userRolesChecked, states
    domain = ContextMaker.domain()
    if (domain) {
        users = VXApp.findUserList()
        domainUsers = VXApp.findDomainUserList(domain)
        decorationIconClassName = Util.isDomainCurrent(domain._id) ? "entity-decoration-icon-medium fa fa-lg fa-asterisk" : null
        decorationColor = "blue"
        decorationTooltip = Util.i18n("common.tooltip_domain_decoration_current")
        userRolesChecked = Util.userRolesMap(users, domain)
        states = UX.makeCodeArray("state")
    }

    return {
        domain,
        users,
        domainUsers,
        decorationIconClassName,
        decorationColor,
        decorationTooltip,
        userRolesChecked,
        states
    }

})(DomainEditRight)

