import { withTracker } from "meteor/react-meteor-data"
import LayoutNone from "/imports/layout/client/LayoutNone"

export default withTracker(props => {

    return {
        content : props.content
    }

})(LayoutNone)
