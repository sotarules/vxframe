import { Component } from "react"
import PropTypes from "prop-types"
import RightPanel from "/imports/vx/client/RightPanel.jsx"
import RightBody from "/imports/vx/client/RightBody.jsx"
import VXForm from "/imports/vx/client/VXForm.jsx"
import ProfilePreferencesRow from "/imports/profile/client/ProfilePreferencesRow.jsx"
import FooterCancelSave from "/imports/vx/client/FooterCancelSave.jsx"

export default class ProfilePreferences extends Component {

    static propTypes = {
        user : PropTypes.object.isRequired,
        preferenceDefinitionObjects : PropTypes.array.isRequired
    }

    render() {
        return (
            <RightPanel>
                <RightBody>
                    <VXForm id="profile-preferences-form"
                        ref={form => {this.form = form}}
                        className="right-panel-form"
                        autoComplete="on"
                        collection={Meteor.users}
                        receiveProps={false}
                        _id={this.props.user._id}
                        updateHandler={this.handleUpdate.bind(this)}>
                        <div className="row">
                            <div className="col-sm-12 flex-section">
                                <div className="preferences-list list-group">
                                    {this.renderPreferences()}
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

    renderPreferences() {
        return this.props.preferenceDefinitionObjects.map(preferenceDefinitionObject => (
            <ProfilePreferencesRow key={preferenceDefinitionObject.preferenceDefinition}
                user={this.props.user}
                preferenceDefinition={preferenceDefinitionObject.preferenceDefinition}
                description={preferenceDefinitionObject.description}/>
        ))
    }

    onReset() {
        UX.resetForm(this.form)
    }

    onSave(laddaCallback) {
        UX.save(this.form, laddaCallback)
    }

    handleUpdate(callback) {

        let standardPreferences

        for (let preferenceDefinition in Meteor.i18nMessages.codes.preferenceDefinition) {

            let componentId = "pserver-" + preferenceDefinition

            let component = UX.findComponentById(componentId)
            if (!component) {
                OLog.error("ProfilePreferences.jsx handleUpdate unable to find componentId=" + componentId)
                continue
            }

            if (!component.getValue()) {
                continue
            }

            standardPreferences = standardPreferences || []

            let standardPreference = {}
            standardPreference.preferenceDefinition = preferenceDefinition
            standardPreference.preferenceValue = component.getValue()

            standardPreferences.push(standardPreference)
        }

        let modifier = {}

        if (standardPreferences) {
            modifier.$set = {}
            modifier.$set["profile.standardPreferences"] = standardPreferences
        }
        else {
            modifier.$unset = {}
            modifier.$unset["profile.standardPreferences"] = ""
        }

        OLog.debug("ProfilePreferences.jsx handleUpdate userId=" + this.props.user._id + " modifier=" + OLog.debugString(modifier))

        Meteor.users.update(this.props.user._id, modifier, function(error) {
            if (callback) {
                if (error) {
                    callback(error)
                    return
                }
                callback(null, { success : true })
            }
        })
    }
}
