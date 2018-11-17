import { Component } from "react"
import PropTypes from "prop-types"
import RadioButtonGroup from "/imports/vx/client/RadioButtonGroup.jsx"
import RadioButton from "/imports/vx/client/RadioButton.jsx"
import TenantEntityList from "/imports/vx/client/TenantEntityList.jsx"
import BottomButton from "/imports/vx/client/BottomButton.jsx"

export default class TenantViewLeft extends Component {

    static PropTypes = {
        id : PropTypes.string.isRequired,
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
                        activeButtonId="button-tenants">
                    <RadioButton id="button-tenants"
                        text={Util.i18n("common.label_my_tenants")}/>
                </RadioButtonGroup>
                <TenantEntityList tenants={this.props.tenants}
                    selectable={true}
                    chevrons={true}
                    onSelect={this.handleSelectTenant.bind(this)}/>
                <BottomButton id="button-create-tenant"
                    className="btn-primary"
                    text={Util.i18n("my_tenants.button_create_tenant")}
                    onClick={this.handleClickCreate.bind(this)}/>
            </div>
        )
    }

    handleSelectTenant(event, component) {
        let currentRequest = {};
        currentRequest.criteria = { _id : component.props._id };
        OLog.debug("TenantViewLeft.jsx handleSelect will select new tenant currentRequest=" + OLog.debugString(currentRequest));
        Session.set("PUBLISH_CURRENT_TENANT", currentRequest);
        if (UX.isSlideMode(true)) {
            UX.iosMinorPush("common.button_my_tenants", "RIGHT");
        }
    }

    handleClickCreate(callback) {
        callback()
        UX.setLocked(["tenant-view-left", "tenant-view-right"], true)
        VXApp.onCreateTenant(callback)
    }
}
