import { Component } from "react"
import PropTypes from "prop-types"
import RadioButtonGroup from "/imports/vx/client/RadioButtonGroup"
import RadioButton from "/imports/vx/client/RadioButton"
import TenantEntityList from "/imports/vx/client/TenantEntityList"
import { setPublishCurrentTenant } from "/imports/vx/client/code/actions"

export default class TenantEditLeft extends Component {

    static propTypes = {
        tenants : PropTypes.array.isRequired
    }

    render() {
        return (
            <div className="left-list-container flexi-grow">
                <RadioButtonGroup id="button-group-tenants"
                    value="TENANTS">
                    <RadioButton id="button-tenants"
                        text={Util.i18n("common.label_my_tenants")}
                        value="TENANTS"/>
                </RadioButtonGroup>
                <TenantEntityList id="tenant-edit-left-list"
                    tenants={this.props.tenants}
                    selectable={true}
                    chevrons={true}
                    onSelect={this.handleSelectTenant.bind(this)}/>
            </div>
        )
    }

    handleSelectTenant(event, component) {
        Store.dispatch(setPublishCurrentTenant(VXApp.simplePublishingRequest(component.props.itemId)))
    }
}
