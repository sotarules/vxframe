import { Component } from "react"
import PropTypes from "prop-types"
import RightPanel from "/imports/vx/client/RightPanel"
import EmptyRightPanel from "/imports/vx/client/EmptyRightPanel"
import RightHeader from "/imports/vx/client/RightHeader"
import VXForm from "/imports/vx/client/VXForm"
import VXInput from "/imports/vx/client/VXInput"
import VXButton from "/imports/vx/client/VXButton"
import EntityListHeader from "/imports/vx/client/EntityListHeader"
import DomainEntityList from "/imports/vx/client/DomainEntityList"

export default class UserEditRight extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        user : PropTypes.object,
        domains : PropTypes.array,
        domainRolesChecked : PropTypes.object,
        currentDomainId : PropTypes.string
    }

    static defaultProps = {
        id : "user-edit-right"
    }

    constructor(props) {
        super(props)
        this.locked = false
    }

    shouldComponentUpdate() {
        return !this.locked
    }

    setLocked(locked) {
        this.locked = locked
    }

    componentDidMount() {
        this.registerDelegates()
    }

    componentDidUpdate() {
        this.registerDelegates()
    }

    registerDelegates() {
        UX.unregisterIosButtonDelegates()
        if (this.props.user) {
            UX.registerIosButtonDelegate("ios-button-done-editing", this.handleDoneEditing.bind(this))
        }
    }

    render() {
        return (
            <div id={this.props.id}
                className="flexi-grow lock-exiting-component">
                {this.props.user ? (
                    <RightPanel>
                        <RightHeader iconUrl={Util.fetchUserPhotoUrl(this.props.user)}
                            rounded={true}
                            name={Util.fetchFullName(this.props.user)}
                            description={Util.getUserEmail(this.props.user)}>
                            <VXForm id="user-edit-right-form"
                                ref={(form) => { this.form = form }}
                                className="right-panel-form flexi-fixed"
                                collection={Meteor.users}
                                dynamic={true}
                                _id={this.props.user._id}>
                                <div className="row">
                                    <div className="col-xs-6">
                                        <VXInput id="email"
                                            label={Util.i18n("common.label_email")}
                                            rule="VX.login.email"
                                            supplementalValues={[ null, this.props.user._id ]}
                                            type="email"
                                            updateHandler={this.updateEmail.bind(this)}
                                            value={Util.getUserEmail(this.props.user)}/>
                                    </div>
                                    <div className="col-xs-6 margin-top-30">
                                        {this.isShowEnrollmentEmailButton() &&
                                            <VXButton id="button-send-enrollment-email"
                                                className="btn btn-primary btn-custom btn-block"
                                                onClick={this.handleClickSendEnrollmentEmail.bind(this)}>
                                                {Util.i18n("user_domain.label_send_enrollment_email")}
                                            </VXButton>
                                        }
                                        {this.isShowSendResetPasswordButton() &&
                                            <VXButton id="button-send-reset-password-email"
                                                className="btn btn-primary btn-custom btn-block"
                                                onClick={this.handleClickSendResetPasswordEmail.bind(this)}>
                                                {Util.i18n("user_domain.label_send_reset_password_email")}
                                            </VXButton>
                                        }
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-xs-6">
                                        <VXInput id="phone"
                                            label={Util.i18n("common.label_phone")}
                                            value={Util.fetchUserPhone(this.props.user)}
                                            supplementalValues={[ "US" ]}
                                            rule={VX.common.phone}
                                            format={FX.phoneUS}
                                            dbName={"profile.phone"}/>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-xs-6">
                                        <VXInput id="mobile"
                                            label={Util.i18n("common.label_mobile")}
                                            value={Util.fetchUserMobile(this.props.user)}
                                            supplementalValues={[ "US" ]}
                                            rule={VX.common.mobile}
                                            format={FX.phoneUS}
                                            dbName={"profile.mobile"}/>
                                    </div>
                                </div>
                            </VXForm>
                        </RightHeader>
                        <EntityListHeader label={Util.i18n("user_domain.label_domains_header")}/>
                        <DomainEntityList id="user-edit-right-list"
                            domains={this.props.domains}
                            currentDomainId={this.props.currentDomainId}
                            rightPanel={true}
                            droppable={true}
                            dropClassName="domain-drop-list"
                            roleCheckboxes={true}
                            roleCheckboxesDisabled={false}
                            domainRolesChecked={this.props.domainRolesChecked}
                            roleCheckboxUpdateHandler={this.handleUpdateRoleCheckbox.bind(this)}
                            controls={[{
                                className: "fa-times",
                                onClick: this.handleClickDelete.bind(this)
                            }]}
                            onDrop={this.handleDropDomain.bind(this)}/>
                    </RightPanel>
                ) : (
                    <EmptyRightPanel emptyMessage={Util.i18n("common.empty_edit_record_missing")}/>
                )}
            </div>
        )
    }

    isShowEnrollmentEmailButton() {
        let email = Util.getUserEmail(this.props.user)
        let enrolled = Util.getProfileValue("enrolled", this.props.user)
        return email && !enrolled
    }

    isShowSendResetPasswordButton() {
        let email = Util.getUserEmail(this.props.user)
        let enrolled = Util.getProfileValue("enrolled", this.props.user)
        return email && enrolled
    }

    handleDoneEditing() {
        OLog.debug("UserEditRight.jsx handleDoneEditing")
        UX.iosPopAndGo("crossfade")
    }

    handleClickSendEnrollmentEmail(callback) {
        Meteor.call("sendEnrollmentEmail", this.props.user._id, (error, result) => {
            callback()
            UX.notify(result, error)
        })
    }

    handleClickSendResetPasswordEmail(callback) {
        Meteor.call("sendResetPasswordEmail", this.props.user._id, (error, result) => {
            callback()
            UX.notify(result, error)
        })
    }

    handleDropDomain(event, entityTarget, ui, component) {
        OLog.debug(`UserEditRight.jsx handleDropDomain componentId=${component.props.id}`)
        VXApp.updateUserDomain(entityTarget, ui)
    }

    updateEmail(component, strippedValue) {
        let modifier = {}
        modifier.$set = {}
        modifier.$set.username = strippedValue
        modifier.$set.emails = [ {  address: strippedValue,  verified: true }]
        OLog.debug(`UserEditRight.jsx updateEmail strippedValue=${strippedValue} modifier=${OLog.debugString(modifier)}`)
        Meteor.users.update(this.props.user._id, modifier, (error) => {
            if (error) {
                OLog.error("UserEditRight.jsx updateEmail error returned from dynamic field update=" + error)
                UX.notifyForDatabaseError(error)
                return
            }
            OLog.debug("UserEditRight.jsx updateEmail *success*")
        })
    }

    handleUpdateRoleCheckbox(component, value, userRole, domainId) {
        OLog.debug(`UserEditRight.jsx handleUpdateRoleCheckbox componentId=${component.props.id} userRole=${userRole} value=${value} domainId=${domainId} userId=${this.props.user._id}`)
        VXApp.updateTenantOrDomainRole(this.props.user._id, domainId, userRole, false, value)
    }

    handleClickDelete(event, component) {
        OLog.debug(`UserEditRight.jsx handleClickDelete delete userId=${this.props.user._id} domainId=${component.props._id}`)
        VXApp.deleteUserDomain(this.props.user._id, component.props._id)
    }
}
