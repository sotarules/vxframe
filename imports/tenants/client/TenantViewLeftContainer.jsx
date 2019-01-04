import { withTracker } from "meteor/react-meteor-data"
import TenantViewLeft from "/imports/tenants/client/TenantViewLeft"

export default withTracker(() => {

    return {
        tenants : VXApp.findTenantList(Meteor.userId())
    }

})(TenantViewLeft)
