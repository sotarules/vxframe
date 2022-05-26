import {Component} from "react"
import PropTypes from "prop-types"
import RightPanel from "/imports/vx/client/RightPanel"
import EmptyRightPanel from "/imports/vx/client/EmptyRightPanel"
import RightHeader from "/imports/vx/client/RightHeader"
import VXForm from "/imports/vx/client/VXForm"
import VXFieldBox from "/imports/vx/client/VXFieldBox"
import EntityListHeader from "/imports/vx/client/EntityListHeader"
import UserEntityList from "/imports/vx/client/UserEntityList"
import RetireModal from "/imports/vx/client/RetireModal"
import {setPublishAuthoringDomain} from "/imports/vx/client/code/actions"

export default class UserDomainViewRight extends Component {

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
        id : "domain-user-view-right"
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
        if (this.props.domain) {
            UX.registerIosButtonDelegate("ios-button-edit", this.handleEdit.bind(this))
            UX.registerIosButtonDelegate("ios-button-clone", this.handleClone.bind(this))
            UX.registerIosButtonDelegate("ios-button-delete", this.handleDelete.bind(this))
        }
    }

    render() {
        return (
            <div id={this.props.id}
                className="flexi-grow lock-exiting-component">
                {this.props.domain ? (
                    <RightPanel>
                        <RightHeader iconUrl={Util.fetchDomainIconUrl(this.props.domain._id)}
                            name={this.props.domain.name}
                            description={this.props.domain.description}
                            decorationIconClassName={this.props.decorationIconClassName}
                            decorationColor={this.props.decorationColor}
                            decorationTooltip={this.props.decorationTooltip}>
                            <VXForm id="domain-user-view-right-form"
                                ref={(form) => { this.form = form }}
                                className="right-panel-form flexi-fixed">
                                <div className="row">
                                    <div className="col-xs-12">
                                        <VXFieldBox label={Util.i18n("common.label_billing_address")}
                                            value={this.props.domain.billingAddress1}/>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-xs-12">
                                        <VXFieldBox label={Util.i18n("common.label_billing_city")}
                                            value={this.props.domain.billingCity}/>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-xs-6">
                                        <VXFieldBox label={Util.i18n("common.label_billing_state")}
                                            value={this.formatBillingState()}/>
                                    </div>
                                    <div className="col-xs-6">
                                        <VXFieldBox label={Util.i18n("common.label_billing_zip")}
                                            value={this.props.domain.billingZip}/>
                                    </div>
                                </div>
                            </VXForm>
                        </RightHeader>
                        <EntityListHeader label={Util.i18n("my_domains.label_users_header")}/>
                        <UserEntityList id="domain-user-view-right-list"
                            users={this.props.users}
                            rightPanel={true}
                            roleCheckboxes={true}
                            roleCheckboxesDisabled={true}
                            userRolesChecked={this.props.userRolesChecked}/>
                    </RightPanel>
                ) : (
                    <EmptyRightPanel emptyMessage={Util.i18n("common.empty_domain_rhs_details")}/>
                )}
            </div>
        )
    }

    formatBillingState() {
        return this.props.domain.billingState ? Util.i18n("codes.state." + this.props.domain.billingState) : null
    }

    handleEdit(callback) {
        OLog.debug("DomainUserViewRight.jsx handleEdit")
        callback()
        UX.iosMajorPush(null, null, "/domain/" + this.props.domain._id, "RIGHT", "crossfade")
    }

    handleClone(callback) {
        callback()
        UX.setLocked(["domain-user-view-left"], true)
        Meteor.call("cloneDomain", this.props.domain._id, (error, result) => {
            UX.notify(result, error)
            const publishAuthoringDomain = {}
            publishAuthoringDomain.criteria = { _id: result.domainId }
            Store.dispatch(setPublishAuthoringDomain(publishAuthoringDomain))
            UX.iosMajorPush(null, null, `/domain/${result.domainId}`, "RIGHT", "crossfade")
        })
    }

    handleDelete(callback) {
        OLog.debug("DomainUserViewRight.jsx handleDelete")
        callback()
        UX.showModal(<RetireModal title={Util.i18n("common.label_retire_domain")}
            collection={Domains}
            _id={this.props.domain._id}
            retireMethod="retireDomain"
            publishSetAction={setPublishAuthoringDomain}/>)
    }
}
