import { Component } from "react"
import PropTypes from "prop-types"
import RadioButtonGroup from "/imports/vx/client/RadioButtonGroup"
import RadioButton from "/imports/vx/client/RadioButton"
import TenantEntityList from "/imports/vx/client/TenantEntityList"

export default class TenantEditLeft extends Component {

    static propTypes = {
        tenants : PropTypes.array.isRequired
    }

    render() {
        return (
            <div className="left-list-container flexi-grow">
                <RadioButtonGroup id="button-group-tenants"
                        activeButtonId="button-tenants">
                    <RadioButton id="button-tenants"
                        text={Util.i18n("common.label_my_tenants")}/>
                </RadioButtonGroup>
                <TenantEntityList tenants={this.props.tenants}
                    selectable={false}
                    chevrons={false}/>
            </div>
        )
    }
}
