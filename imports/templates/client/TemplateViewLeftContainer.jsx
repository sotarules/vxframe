import { withTracker } from "meteor/react-meteor-data"
import TemplateViewLeft from "/imports/templates/client/TemplateViewLeft"

export default withTracker(( ) => {
    const publishRequest = Store.getState().publishCurrentTemplates
    return {
        templates : Templates.find(publishRequest.criteria, publishRequest.options).fetch()
    }
})(TemplateViewLeft)
