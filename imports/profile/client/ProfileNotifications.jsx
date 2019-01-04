import { Component } from "react"
import PropTypes from "prop-types"
import RightPanel from "/imports/vx/client/RightPanel"
import RightBody from "/imports/vx/client/RightBody"
import VXForm from "/imports/vx/client/VXForm"
import ProfileNotificationsRow from "/imports/profile/client/ProfileNotificationsRow"
import FooterCancelSave from "/imports/vx/client/FooterCancelSave"

export default class ProfileNotifications extends Component {

    static propTypes = {
        user : PropTypes.object.isRequired,
        eventTypeObjects : PropTypes.array.isRequired
    }

    render() {
        return (
            <RightPanel>
                <RightBody>
                    <VXForm id="profile-notifications-form"
                        ref={form => {this.form = form}}
                        className="right-panel-form"
                        autoComplete="on"
                        collection={Meteor.users}
                        receiveProps={false}
                        _id={this.props.user._id}
                        updateHandler={this.handleUpdate.bind(this)}>
                        <div className="row">
                            <div className="col-sm-12 flex-section">
                                <div className="notificationprefs-list list-group">
                                    {this.renderNotifications()}
                                </div>
                            </div>
                        </div>
                    </VXForm>
                </RightBody>
                <FooterCancelSave ref={(footer) => {this.footer = footer} }
                    id="right-panel-footer"
                    onReset={this.onReset.bind(this)}
                    onSave={this.onSave.bind(this)}/>
            </RightPanel>
        )
    }

    renderNotifications() {
        return this.props.eventTypeObjects.map(eventTypeObject => (
            <ProfileNotificationsRow key={eventTypeObject.eventType}
                user={this.props.user}
                eventType={eventTypeObject.eventType}
                description={eventTypeObject.description}/>
        ))
    }

    onReset() {
        UX.resetForm(this.form)
    }

    onSave(laddaCallback) {
        UX.save(this.form, laddaCallback)
    }

    handleUpdate(callback) {

        let notificationPreferences

        for (let eventType in Meteor.i18nMessages.codes.eventType) {

            if (!Util.isNotificationEventType(eventType)) {
                continue
            }

            let eventTypeObject = Meteor.i18nMessages.codes.eventType[eventType]

            let notificationPreference = {}

            notificationPreference.eventType = eventType
            notificationPreference.optOut = []
            notificationPreference.optIn = []

            this.setOptInOrOptOut(eventTypeObject, notificationPreference, "popup-" + eventType, "PNOTIFY")
            this.setOptInOrOptOut(eventTypeObject, notificationPreference, "email-" + eventType, "EMAIL")
            this.setOptInOrOptOut(eventTypeObject, notificationPreference, "sms-" + eventType, "SMS")

            if (notificationPreference.optOut.length > 0 || notificationPreference.optIn.length > 0) {
                notificationPreferences = notificationPreferences || []
                notificationPreferences.push(notificationPreference)
            }
        }

        let modifier = {}

        if (notificationPreferences) {
            modifier.$set = {}
            modifier.$set["profile.notificationPreferences"] = notificationPreferences
        }
        else {
            modifier.$unset = {}
            modifier.$unset["profile.notificationPreferences"] = ""
        }

        OLog.debug("ProfileNotifications.jsx handleUpdate userId=" + this.props.user._id + " modifier=" + OLog.debugString(modifier))

        Meteor.users.update(this.props.user._id, modifier, error => {
            if (callback) {
                if (error) {
                    callback(error)
                    return
                }
                callback(null, { success : true })
            }
        })
    }

    setOptInOrOptOut(eventTypeObject, notificationPreference, componentId, mode) {

        let component = UX.findComponentById(componentId)
        if (!component) {
            OLog.error("ProfileNotifications.jsx setOptInOrOptOut unable to find componentId=" + componentId)
            return
        }

        if (component.getValue()) {

            if (_.contains(eventTypeObject.notificationDefaults, mode)) {
                // Checked matches default, do nothing
            }
            else {
                // Checked differs from default, user has explicitly opted in (contradicted):
                notificationPreference.optIn.push(mode)
            }
        }
        else {
            if (_.contains(eventTypeObject.notificationDefaults, mode)) {
                // Unchecked differs from default, user has explicitly opted out (contradicted):
                notificationPreference.optOut.push(mode)
            }
            else {
                // Unchecked matches default, do nothing
            }
        }
    }
}
