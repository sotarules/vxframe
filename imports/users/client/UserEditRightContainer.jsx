import { withTracker } from "meteor/react-meteor-data"
import UserEditRight from "/imports/users/client/UserEditRight"

export default withTracker(( ) => {
    let domains, user, userDomains, domainRolesChecked, currentDomainId
    user = ContextMaker.user()
    if (user) {
        domains = VXApp.findDomainList()
        userDomains = VXApp.findUserDomainList(user)
        domainRolesChecked = Util.domainRolesMap(domains, user)
        currentDomainId = Util.getCurrentDomainId(user._id)
    }
    return {
        domains,
        user,
        userDomains,
        domainRolesChecked,
        currentDomainId
    }
})(UserEditRight)

