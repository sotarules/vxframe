import {Component} from "react"
import PropTypes from "prop-types"
import VXModal from "/imports/vx/client/VXModal"
import ModalHeaderImage from "/imports/vx/client/ModalHeaderImage"
import ModalBody from "/imports/vx/client/ModalBody"
import ModalFooterConfirm from "/imports/vx/client/ModalFooterConfirm"
import VXForm from "/imports/vx/client/VXForm"
import VXAnchor from "/imports/vx/client/VXAnchor"
import VXCheck from "/imports/vx/client/VXCheck"

export default class UserPermissionsModal extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        domainId : PropTypes.string.isRequired,
        userId : PropTypes.string.isRequired
    }

    static defaultProps = {
        id : "user-permissions-modal"
    }

    constructor(props) {
        super(props)
        const permissions = Util.fetchUserDomainField(props.userId, props.domainId, "permissions")
        this.state = { permissions }
    }

    render() {
        return (
            <VXModal id={this.props.id} width="750px">
                <ModalHeaderImage imageUrl={`${CX.CLOUDFILES_PREFIX}/img/system/user.png`}
                    heading={Util.i18n("common.label_permissions")}
                    subheading={this.subheading()}/>
                <ModalBody className="modal-body-no-bottom">
                    <VXForm id="user-permissions-modal-form"
                        elementType="div"
                        className="margin-top-20 margin-bottom-20"
                        ref={(form) => { this.form = form }}>
                        {this.renderCheckboxes()}
                    </VXForm>
                </ModalBody>
                <ModalFooterConfirm onClickConfirm={this.handleClickConfirm.bind(this)}/>
                <VXAnchor id="user-permissions-modal-anchor"/>
            </VXModal>
        )
    }


    renderCheckboxes() {
        const permissionTypeArray = VXApp.makePermissionTypeArray(this.props.domainId)
        return permissionTypeArray.map(codeObject => (
            <VXCheck id={this.props.id + "-" + codeObject.code}
                key={this.props.id + "-" + codeObject.code}
                code={codeObject.code}
                label={codeObject.localized}
                className="checkbox-singlespace"
                checked={this.isChecked(codeObject.code)}
                onChange={this.handleChange.bind(this)}/>
        ))
    }

    subheading() {
        const params = {
            domainName : Util.fetchDomainName(this.props.domainId),
            fullName : Util.fetchFullName(this.props.userId)
        }
        return Util.i18n("common.label_permissions_modal_subheading", params)
    }

    isChecked(code) {
        return this.state.permissions?.includes(code)
    }

    handleChange(event, checked, component) {
        event.persist()
        let permissions = this.state.permissions ? [ ...this.state.permissions ] : []
        if (checked) {
            if (!permissions.includes(component.props.code)) {
                permissions.push(component.props.code)
            }
        }
        else {
            if (permissions.includes(component.props.code)) {
                permissions = _.without(permissions, component.props.code)
            }
        }
        permissions = permissions.length > 0 ? permissions : null
        OLog.debug(`UserPermissionsModal handleChange id=${this.props.id} checked=${checked} ` +
            `code=${component.props.code} permissions=${OLog.debugString(permissions)}`)
        this.setState({ permissions })
    }

    handleClickConfirm(callback) {
        const op = this.state.permissions ? "$set" : "$unset"
        Util.updateUserDomainField(this.props.userId, this.props.domainId, "permissions", this.state.permissions, op)
        callback(true)
    }
}
