import { withTracker } from "meteor/react-meteor-data"
import TenantEditLeft from "/imports/tenants/client/TenantEditLeft"

export default withTracker(( ) => {
    const tenants = VXApp.findUserTenantList()
    return {
        tenants
    }
})(TenantEditLeft)
