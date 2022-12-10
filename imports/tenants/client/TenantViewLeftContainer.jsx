import { withTracker } from "meteor/react-meteor-data"
import TenantViewLeft from "/imports/tenants/client/TenantViewLeft"

export default withTracker(() => {
    const user = Util.fetchUserLimited(Meteor.userId())
    const tenants = VXApp.findUserTenantList(user)
    return {
        user,
        tenants
    }
})(TenantViewLeft)
