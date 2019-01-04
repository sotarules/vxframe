import { withTracker } from "meteor/react-meteor-data"
import TemplateEditLeft from "/imports/templates/client/TemplateEditLeft"

export default withTracker(( ) => {

    let publishRequest = Store.getState().publishCurrentTemplates

    return {
        templates : Templates.find(publishRequest.criteria, publishRequest.options).fetch()
    }

})(TemplateEditLeft)
