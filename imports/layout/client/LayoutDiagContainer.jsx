import { withTracker } from "meteor/react-meteor-data"
import LayoutDiag from "/imports/layout/client/LayoutDiag"

export default withTracker(props => {

    return {
        isAuthorizedRoute : !!VXApp.isAuthorizedRoute(),
        content : props.content
    }

})(LayoutDiag)
