import { withTracker } from "meteor/react-meteor-data"
import TemplateEditLeft from "/imports/templates/client/TemplateEditLeft.jsx"

export default withTracker(( ) => {

    let templatesPublishRequest = Session.get("PUBLISH_CURRENT_TEMPLATES")

    return {
        templates : Templates.find(templatesPublishRequest.criteria, templatesPublishRequest.options).fetch()
    }

})(TemplateEditLeft)
