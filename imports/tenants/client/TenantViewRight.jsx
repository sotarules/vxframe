import {Component} from "react"
import PropTypes from "prop-types"
import RightPanel from "/imports/vx/client/RightPanel"
import EmptyRightPanel from "/imports/vx/client/EmptyRightPanel"
import RightHeader from "/imports/vx/client/RightHeader"
import EntityListHeader from "/imports/vx/client/EntityListHeader"
import DomainEntityList from "/imports/vx/client/DomainEntityList"
import RetireModal from "/imports/vx/client/RetireModal"
import {setPublishCurrentDomain, setPublishCurrentTenant} from "/imports/vx/client/code/actions"

export default class TenantViewRight extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        tenant : PropTypes.object,
        decorationIconClassName : PropTypes.string,
        decorationColor : PropTypes.oneOf(["blue"]),
        decorationTooltip : PropTypes.string,
        domains : PropTypes.array,
        domainRolesChecked : PropTypes.object,
        currentDomainId : PropTypes.string
    }

    static defaultProps = {
        id : "tenant-view-right"
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
        if (this.props.tenant && Util.isUserSuperAdmin()) {
            UX.registerIosButtonDelegate("ios-button-edit", this.handleEdit.bind(this))
            UX.registerIosButtonDelegate("ios-button-delete", this.handleDelete.bind(this))
        }
    }

    render() {
        return (
            <div id={this.props.id}
                className="flexi-grow lock-exiting-component">
                {this.props.tenant ? (
                    <RightPanel>
                        <RightHeader iconUrl={Util.fetchTenantIconUrl(this.props.tenant._id)}
                            name={this.props.tenant.name}
                            description={this.props.tenant.description}
                            decorationIconClassName={this.props.decorationIconClassName}
                            decorationColor={this.props.decorationColor}
                            decorationTooltip={this.props.decorationTooltip}>
                        </RightHeader>
                        <EntityListHeader label={Util.i18n("my_tenants.label_domains_header")}/>
                        <DomainEntityList id="tenant-view-right-list"
                            domains={this.props.domains}
                            currentDomainId={this.props.currentDomainId}
                            selectable={true}
                            chevrons={true}
                            rightPanel={true}
                            roleCheckboxes={true}
                            roleCheckboxesDisabled={true}
                            domainRolesChecked={this.props.domainRolesChecked}
                            onSelect={this.handleSelectDomain.bind(this)}/>
                    </RightPanel>
                ) : (
                    <EmptyRightPanel emptyMessage={Util.i18n("common.empty_tenant_rhs_details")}/>
                )}
            </div>
        )
    }

    handleEdit(callback) {
        OLog.debug("TenantViewRight.jsx handleEdit")
        callback()
        UX.iosMajorPush(null, null, "/tenant", "RIGHT", "crossfade")
    }

    handleDelete(callback) {
        OLog.debug("TenantViewRight.jsx handleDelete")
        callback()
        UX.showModal(<RetireModal title={Util.i18n("common.label_retire_tenant")}
            collection={Tenants}
            _id={this.props.tenant._id}
            retireMethod="retireTenant"
            publishSetAction={setPublishCurrentTenant}/>)
    }

    handleSelectDomain(event, component) {
        OLog.debug(`TenantViewRight.jsx handleSelectDomain componentId=${component.props.itemId}`)
        Store.dispatch(setPublishCurrentDomain(VXApp.simplePublishingRequest(component.props.itemId)))
        UX.iosMajorPush("common.button_my_tenants", "common.button_my_tenant", "/domains", "RIGHT")
    }
}
