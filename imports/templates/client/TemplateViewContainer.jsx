import { withTracker } from "meteor/react-meteor-data"
import TemplateView from "/imports/templates/client/TemplateView.jsx"

export default withTracker(() => {

    let result = VXApp.getSubscriptionParameters()
    if (!result.success) {
        OLog.debug("TemplateViewContainer.jsx withTracker subscription parameters not ready result=" + OLog.debugString(result))
        return
    }

    let ready = new ReactiveVar(false)
    let subscriptionParameters = result.subscriptionParameters
    let templatesPublishRequest = VXApp.makePublishingRequest("templates", subscriptionParameters, { dateRetired : { $exists: false } }, { sort: { name: 1 } })

    Session.set("PUBLISH_CURRENT_TEMPLATES", templatesPublishRequest.client)

    let handles = []
    handles.push(Meteor.subscribe("templates", templatesPublishRequest.server))
    UX.waitSubscriptions(handles, function() {
        ready.set(true)
        UX.clearLoading()
    })
    return {
        ready : !!ready.get()
    }

})(TemplateView)
