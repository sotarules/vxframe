import { withTracker } from "meteor/react-meteor-data"
import FunctionViewLeft from "/imports/functions/client/FunctionViewLeft"

export default withTracker(( ) => {

    let publishCurrentFunctions = Store.getState().publishCurrentFunctions

    return {
        functions : Functions.find(publishCurrentFunctions.criteria, publishCurrentFunctions.options).fetch()
    }

})(FunctionViewLeft)
