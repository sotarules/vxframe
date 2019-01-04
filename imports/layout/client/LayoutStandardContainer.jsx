import { withTracker } from "meteor/react-meteor-data"
import LayoutStandard from "/imports/layout/client/LayoutStandard"

export default withTracker(props => {

    return {
        isAuthorizedRoute : !!VXApp.isAuthorizedRoute(),
        routePath : Util.routePath(),
        content : props.content
    }

})(LayoutStandard)
