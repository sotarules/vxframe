import { withTracker } from "meteor/react-meteor-data"
import UserEditRight from "/imports/users/client/UserEditRight"

export default withTracker(( ) => {
    let user, domains, domainRolesChecked, currentDomainId
    user = ContextMaker.user()
    if (user) {
        domains = _.pluck(VXApp.findUserDomainList(user._id), "domain")
        domainRolesChecked = Util.domainRolesMap(domains, user)
        currentDomainId = Util.getCurrentDomainId(user._id)
    }
    return {
        user,
        domains,
        domainRolesChecked,
        currentDomainId
    }
})(UserEditRight)

