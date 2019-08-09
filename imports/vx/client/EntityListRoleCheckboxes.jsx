import { Component } from "react"
import PropTypes from "prop-types"
import VXForm from "/imports/vx/client/VXForm"
import VXCheck from "/imports/vx/client/VXCheck"

export default class EntityListRoleCheckboxes extends Component {

    static propTypes = {
        _id : PropTypes.string.isRequired,
        collection : PropTypes.object,
        rolesChecked : PropTypes.array.isRequired,
        roleCheckboxesDisabled : PropTypes.bool,
        tenantRoles : PropTypes.bool.isRequired,
        updateHandler : PropTypes.func,
        className : PropTypes.string,
    }

    render() {
        return (
            <VXForm id={`vx-form-entity-item-${this.props._id}`}
                elementType="td"
                _id={this.props._id}
                collection={this.props.collection}
                dynamic={true}
                className={this.props.className}>
                <div className="role-checkboxes">
                    {this.renderCheckboxes()}
                </div>
            </VXForm>
        )
    }

    renderCheckboxes() {
        let userRoles = _.filter(Object.keys(Meteor.i18nMessages.codes.userRole), key => {
            return Meteor.i18nMessages.codes.userRole[key].tenantRole === this.props.tenantRoles
        })
        return userRoles.map(userRole => (
            <VXCheck key={this.checkboxKey(userRole)}
                id={this.checkboxKey(userRole)}
                className="role-checkbox"
                userRole={userRole}
                label={Util.i18n("codes.userRole." + userRole)}
                checked={_.contains(this.props.rolesChecked, userRole)}
                disabled={this.props.roleCheckboxesDisabled}
                updateHandler={this.handleUpdate.bind(this)}/>
        ))
    }

    checkboxKey(userRole) {
        return `role-checkbox-${userRole}-${this.props._id}`
    }

    handleUpdate(component, value) {
        OLog.debug("EntityListRoleCheckboxes.jsx handleUpdate componentId=" + component.props.id + " value=" + value + " _id=" + this.props._id)
        if (this.props.updateHandler) {
            this.props.updateHandler(component, value, component.props.userRole, this.props._id)
        }
    }
}
