import { withTracker } from "meteor/react-meteor-data"
import TemplateViewLeft from "/imports/templates/client/TemplateViewLeft.jsx"

export default withTracker(( ) => {

    let templatesPublishRequest = Session.get("PUBLISH_CURRENT_TEMPLATES")

    return {
        templates : Templates.find(templatesPublishRequest.criteria, templatesPublishRequest.options).fetch()
    }

})(TemplateViewLeft)
