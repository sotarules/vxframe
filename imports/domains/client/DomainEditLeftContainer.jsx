import { withTracker } from "meteor/react-meteor-data"
import DomainEditLeft from "/imports/domains/client/DomainEditLeft.jsx"

export default withTracker(( ) => {

    return {
        users : VXApp.findUserList()
    }

})(DomainEditLeft)
