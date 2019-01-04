import { Component } from "react"
import PropTypes from "prop-types"
import RightPanel from "/imports/vx/client/RightPanel.jsx"
import RightHeaderBasic from "/imports/vx/client/RightHeaderBasic.jsx"
import VXForm from "/imports/vx/client/VXForm.jsx"
import VXImage from "/imports/vx/client/VXImage.jsx"
import VXInput from "/imports/vx/client/VXInput.jsx"
import EntityListHeader from "/imports/vx/client/EntityListHeader.jsx"
import DomainEntityList from "/imports/vx/client/DomainEntityList.jsx"

export default class TenantEditRight extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        tenant : PropTypes.object.isRequired,
        decorationIconClassName : PropTypes.string,
        decorationColor : PropTypes.oneOf(["blue"]),
        decorationTooltip : PropTypes.string,
        userEmail : PropTypes.string.isRequired,
        isUserTenantAdmin : PropTypes.bool.isRequired,
        domains : PropTypes.array.isRequired,
        currentDomainId : PropTypes.string.isRequired
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
        UX.registerIosButtonDelegate("ios-button-done-editing", this.handleDoneEditing.bind(this))
    }

    render() {
        return (
            <div id={this.props.id}
                className="flexi-grow">
                <RightPanel>
                    <RightHeaderBasic>
                        <VXForm id="tenant-edit-right-form"
                            ref={(form) => { this.form = form }}
                            className="right-panel-form flexi-fixed"
                            dynamic={true}
                            collection={Tenants}
                            _id={this.props.tenant._id}>
                            <div className="row">
                                <div className="col-sm-12">
                                    <table className="top-table">
                                        <tbody>
                                            <tr>
                                                <td className="top-left">
                                                    <VXImage id="iconUrl"
                                                        size="small"
                                                        imageType="tenant"
                                                        value={this.props.tenant.iconUrl}/>
                                                </td>
                                                <td className="top-center">
                                                    <div className="top-input">
                                                        <VXInput id="name"
                                                            required={true}
                                                            value={this.props.tenant.name}/>
                                                        <VXInput id="description"
                                                            value={this.props.tenant.description}/>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </VXForm>
                    </RightHeaderBasic>
                    <EntityListHeader label={Util.i18n("my_tenants.label_domains_header")}/>
                    <DomainEntityList id="tenant-edit-right-list"
                        domains={this.props.domains}
                        currentDomainId={this.props.currentDomainId}
                        selectable={false}
                        chevrons={false}
                        rightPanel={true}/>
                </RightPanel>
            </div>
        )
    }

    handleDoneEditing() {
        OLog.debug("TenantEditRight.jsx handleDoneEditing")
        UX.iosPopAndGo("crossfade")
    }
}
