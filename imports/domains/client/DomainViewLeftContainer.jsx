import { withTracker } from "meteor/react-meteor-data"
import DomainViewLeft from "/imports/domains/client/DomainViewLeft"

export default withTracker(( ) => {

    return {
        domains : VXApp.findDomainList(),
        currentDomainId : Util.getCurrentDomainId(Meteor.userId())
    }

})(DomainViewLeft)
