import { Component } from "react"
import PropTypes from "prop-types"
import RadioButtonGroup from "/imports/vx/client/RadioButtonGroup"
import RadioButton from "/imports/vx/client/RadioButton"
import TenantEntityList from "/imports/vx/client/TenantEntityList"
import BottomButton from "/imports/vx/client/BottomButton"
import { setPublishCurrentTenant } from "/imports/vx/client/code/actions"

export default class TenantViewLeft extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        user : PropTypes.object.isRequired,
        tenants : PropTypes.array.isRequired
    }

    static defaultProps = {
        id : "tenant-view-left"
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

    render() {
        return (
            <div id={this.props.id}
                className="left-list-container flexi-grow">
                <RadioButtonGroup id="button-group-tenants"
                    value="TENANTS">
                    <RadioButton id="button-tenants"
                        text={Util.i18n("common.label_my_tenants")}
                        value="TENANTS"/>
                </RadioButtonGroup>
                <TenantEntityList id="tenant-view-left-list"
                    user={this.props.user}
                    tenants={this.props.tenants}
                    selectable={true}
                    chevrons={true}
                    onSelect={this.handleSelectTenant.bind(this)}/>
                {Util.isUserSuperAdmin() &&
                    <BottomButton id="button-create-tenant"
                        className="btn-primary"
                        text={Util.i18n("my_tenants.button_create_tenant")}
                        onClick={this.handleClickCreate.bind(this)}/>
                }
            </div>
        )
    }

    handleSelectTenant(event, component) {
        Store.dispatch(setPublishCurrentTenant(VXApp.simplePublishingRequest(component.props.itemId)))
        if (UX.isSlideMode()) {
            UX.iosMinorPush("common.button_my_tenants", "RIGHT")
        }
    }

    handleClickCreate(callback) {
        UX.setLocked(["tenant-view-left", "tenant-view-right"], true)
        VXApp.onCreateTenant(callback)
    }
}
