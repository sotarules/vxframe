import { withTracker } from "meteor/react-meteor-data"
import UserEditRight from "/imports/users/client/UserEditRight"

export default withTracker(( ) => {

    const user = ContextMaker.user()
    if (!user) {
        return {}
    }

    const domains = _.pluck(VXApp.findUserDomainList(user._id), "domain")
    const domainRolesChecked = Util.domainRolesMap(domains, user)

    return {
        user : user,
        domains : domains,
        domainRolesChecked : domainRolesChecked,
        currentDomainId : Util.getCurrentDomainId(user._id)
    }

})(UserEditRight)

