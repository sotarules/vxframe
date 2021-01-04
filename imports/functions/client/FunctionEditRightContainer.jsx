import { withTracker } from "meteor/react-meteor-data"
import FunctionEditRight from "/imports/functions/client/FunctionEditRight"

export default withTracker(( ) => {

    let funktion

    funktion = ContextMaker.funktion()

    return {
        funktion
    }

})(FunctionEditRight)
