import { withTracker } from "meteor/react-meteor-data"
import SlidePair from "/imports/vx/client/SlidePair.jsx"

export default withTracker(props => {

    const result = {
        name : props.name,
        leftPanel : props.leftPanel,
        rightPanel : props.rightPanel,
        leftColumnCount : props.leftColumnCount,
        rightColumnCount : props.rightColumnCount,
        slideMode : UX.isSlideMode(),
        panel : UX.getCurrentPanel(Util.routePath())
    }

    return result

})(SlidePair)
