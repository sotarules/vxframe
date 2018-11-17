import { withTracker } from "meteor/react-meteor-data"
import DomainUserViewLeft from "/imports/usersdomains/client/DomainUserViewLeft.jsx"

export default withTracker(( ) => {

    return {
        domains : VXApp.findDomainList()
    }

})(DomainUserViewLeft)
