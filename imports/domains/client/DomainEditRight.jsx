import { Component } from "react"
import PropTypes from "prop-types"
import RightPanel from "/imports/vx/client/RightPanel"
import EmptyRightPanel from "/imports/vx/client/EmptyRightPanel"
import RightHeaderBasic from "/imports/vx/client/RightHeaderBasic"
import VXForm from "/imports/vx/client/VXForm"
import VXImage from "/imports/vx/client/VXImage"
import VXInput from "/imports/vx/client/VXInput"
import VXSelect from "/imports/vx/client/VXSelect"
import EntityListHeader from "/imports/vx/client/EntityListHeader"
import UserEntityList from "/imports/vx/client/UserEntityList"

export default class DomainEditRight extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        domain : PropTypes.object,
        users : PropTypes.array,
        decorationIconClassName : PropTypes.string,
        decorationColor : PropTypes.oneOf(["blue"]),
        decorationTooltip : PropTypes.string,
        userRolesChecked : PropTypes.object,
        currentDomainId : PropTypes.string
    }

    static defaultProps = {
        id : "domain-edit-right"
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
        UX.registerIosButtonDelegate("ios-button-done-editing", this.handleDoneEditing.bind(this))
    }

    render() {
        return (
            <div id={this.props.id}
                className="flexi-grow lock-exiting-component">
                {this.props.domain ? (
                    <RightPanel>
                        <RightHeaderBasic>
                            <VXForm id="domain-edit-right-form"
                                ref={(form) => { this.form = form }}
                                className="right-panel-form flexi-fixed"
                                dynamic={true}
                                collection={Domains}
                                _id={this.props.domain._id}>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <table className="top-table">
                                            <tbody>
                                                <tr>
                                                    <td className="top-left">
                                                        <VXImage id="iconUrl"
                                                            size="small"
                                                            imageType="domain"
                                                            value={this.props.domain.iconUrl}/>
                                                    </td>
                                                    <td className="top-center">
                                                        <div className="top-input">
                                                            <VXInput id="name"
                                                                required={true}
                                                                value={this.props.domain.name}/>
                                                            <VXInput id="description"
                                                                value={this.props.domain.description}/>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-xs-12">
                                        <VXInput id="billingAddress1"
                                            label={Util.i18n("common.label_billing_address")}
                                            value={this.props.domain.billingAddress1}
                                            rule={VX.common.address1}/>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-xs-12">
                                        <VXInput id="billingCity"
                                            label={Util.i18n("common.label_billing_city")}
                                            value={this.props.domain.billingCity}
                                            rule={VX.common.city}/>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-xs-6">
                                        <VXSelect id="billingState"
                                            codeArray={UX.addBlankSelection(this.props.states)}
                                            label={Util.i18n("common.label_billing_state")}
                                            value={this.props.domain.billingState}
                                            rule={VX.common.state}/>
                                    </div>
                                    <div className="col-xs-6">
                                        <VXInput id="billingZip"
                                            label={Util.i18n("common.label_billing_zip")}
                                            value={this.props.domain.billingZip}
                                            supplementalValues={[ "US" ]}
                                            rule={VX.common.zip}/>
                                    </div>
                                </div>
                            </VXForm>
                        </RightHeaderBasic>
                        <EntityListHeader label={Util.i18n("user_domain.label_users_header")}/>
                        <UserEntityList id="domain-edit-right-list"
                            users={this.props.users}
                            rightPanel={true}
                            droppable={true}
                            dropClassName="user-drop-list"
                            roleCheckboxes={true}
                            roleCheckboxesDisabled={false}
                            userRolesChecked={this.props.userRolesChecked}
                            roleCheckboxUpdateHandler={this.handleUpdateRoleCheckbox.bind(this)}
                            control={true}
                            controlClassName="fa-times"
                            onClickControl={this.handleClickControl.bind(this)}
                            onDrop={this.handleDropUser.bind(this)}/>
                    </RightPanel>
                ) : (
                    <EmptyRightPanel emptyMessage={Util.i18n("common.empty_edit_record_missing")}/>
                )}
            </div>
        )
    }

    handleDoneEditing() {
        OLog.debug("DomainEditRight.jsx handleDoneEditing")
        UX.iosPopAndGo("crossfade")
    }

    handleUpdateRoleCheckbox(component, value, userRole, userId) {
        OLog.debug("DomainEditRight.jsx handleUpdateRoleCheckbox componentId=" +
            component.props.id + " userRole=" + userRole + " value=" + value + " userId=" + userId + " domainId=" + this.props.domain._id)
        VXApp.updateTenantOrDomainRole(userId, this.props.domain._id, userRole, false, value)
    }

    handleDropUser(event, entityTarget, ui, component) {
        OLog.debug("DomainEditRight.jsx handleDropUser componentId=" + component.props.id)
        VXApp.updateDomainUser(entityTarget, ui)
    }

    handleClickControl(event, component) {
        OLog.debug("DomainEditRight.jsx handleClickControl delete domainId=" + this.props.domain._id + " userId=" + component.props._id)
        VXApp.deleteUserDomain(component.props._id, this.props.domain._id)
    }
}
