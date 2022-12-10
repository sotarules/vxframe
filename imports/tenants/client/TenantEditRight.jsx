import {Component} from "react"
import PropTypes from "prop-types"
import RightPanel from "/imports/vx/client/RightPanel"
import EmptyRightPanel from "/imports/vx/client/EmptyRightPanel"
import EntityListHeader from "/imports/vx/client/EntityListHeader"
import DomainEntityList from "/imports/vx/client/DomainEntityList"
import RightHeaderEdit from "/imports/vx/client/RightHeaderEdit"

export default class TenantEditRight extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        tenant : PropTypes.object,
        decorationIconClassName : PropTypes.string,
        decorationColor : PropTypes.oneOf(["blue"]),
        decorationTooltip : PropTypes.string,
        domains : PropTypes.array,
        currentDomainId : PropTypes.string
    }

    static defaultProps = {
        id : "tenant-edit-right"
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
            UX.registerIosButtonDelegate("ios-button-done-editing", this.handleDoneEditing.bind(this))
        }
    }

    render() {
        return (
            <div id={this.props.id}
                className="flexi-grow lock-exiting-component">
                {this.props.tenant ? (
                    <RightPanel>
                        <RightHeaderEdit id={`${this.props.id}-right-header`}
                            record={this.props.tenant}
                            collection={Tenants}
                            imageType="tenant"
                            iconUrlDbName="iconUrl"
                            nameDbName="name"
                            namePlaceholder={Util.i18n("common.label_name")}
                            descriptionDbName="description"
                            descriptionPlaceholder={Util.i18n("common.label_description")}/>
                        <EntityListHeader label={Util.i18n("my_tenants.label_domains_header")}/>
                        <DomainEntityList id="tenant-edit-right-list"
                            domains={this.props.domains}
                            currentDomainId={this.props.currentDomainId}
                            selectable={false}
                            chevrons={false}
                            rightPanel={true}/>
                    </RightPanel>
                ) : (
                    <EmptyRightPanel emptyMessage={Util.i18n("common.empty_edit_record_missing")}/>
                )}
            </div>
        )
    }

    handleDoneEditing() {
        OLog.debug("TenantEditRight.jsx handleDoneEditing")
        UX.iosPopAndGo("crossfade")
    }
}
