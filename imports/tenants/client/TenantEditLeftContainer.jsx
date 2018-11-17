import { withTracker } from "meteor/react-meteor-data"
import TenantEditLeft from "/imports/tenants/client/TenantEditLeft.jsx"

export default withTracker(( ) => {

    return {
        tenants : VXApp.findTenantList(Meteor.userId())
    }

})(TenantEditLeft)
