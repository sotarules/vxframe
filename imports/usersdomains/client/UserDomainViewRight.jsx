import { Component } from "react"
import PropTypes from "prop-types"
import RightPanel from "/imports/vx/client/RightPanel.jsx"
import RightHeader from "/imports/vx/client/RightHeader.jsx"
import VXForm from "/imports/vx/client/VXForm.jsx"
import VXFieldBox from "/imports/vx/client/VXFieldBox.jsx"
import EntityListHeader from "/imports/vx/client/EntityListHeader.jsx"
import DomainEntityList from "/imports/vx/client/DomainEntityList.jsx"
import RetireModal from "/imports/vx/client/RetireModal.jsx"

export default class UserDomainViewRight extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        user : PropTypes.object.isRequired,
        domains : PropTypes.array.isRequired,
        domainRolesChecked : PropTypes.object.isRequired,
        currentDomainId : PropTypes.string.isRequired
    }

    static defaultProps = {
        id : "user-domain-view-right"
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
        UX.registerIosButtonDelegate("ios-button-edit", this.handleEdit.bind(this))
        UX.registerIosButtonDelegate("ios-button-clone", this.handleClone.bind(this))
        UX.registerIosButtonDelegate("ios-button-delete", this.handleDelete.bind(this))
    }

    render() {
        return (
            <div id={this.props.id}
                className="flexi-grow">
                <RightPanel>
                    <RightHeader iconUrl={Util.fetchUserPhotoUrl(this.props.user)}
                        rounded={true}
                        name={Util.fetchFullName(this.props.user)}
                        description={Util.getUserEmail(this.props.user)}>
                        <VXForm id="user-domain-view-right-form"
                            ref={(form) => { this.form = form }}
                            className="right-panel-form flexi-fixed">
                                <div className="row">
                                    <div className="col-xs-6">
                                        <VXFieldBox label={Util.i18n("common.label_email")}
                                            value={Util.getUserEmail(this.props.user)}/>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-xs-6">
                                        <VXFieldBox label={Util.i18n("common.label_phone")}
                                            value={Util.fetchUserPhone(this.props.user)}/>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-xs-6">
                                        <VXFieldBox label={Util.i18n("common.label_mobile")}
                                            value={Util.fetchUserMobile(this.props.user)}/>
                                    </div>
                                </div>
                        </VXForm>
                    </RightHeader>
                    <EntityListHeader label={Util.i18n("user_domain.label_domains_header")}/>
                    <DomainEntityList id="user-domain-view-right-list"
                        domains={this.props.domains}
                        currentDomainId={this.props.currentDomainId}
                        rightPanel={true}
                        roleCheckboxes={true}
                        roleCheckboxesDisabled={true}
                        domainRolesChecked={this.props.domainRolesChecked}/>
                </RightPanel>
            </div>
        )
    }

    handleEdit(callback) {
        OLog.debug("UserDomainViewRight.jsx handleEditUser")
        callback()
        UX.iosMajorPush(null, null, "/user/" + this.props.user._id, "RIGHT", "crossfade")
    }

    handleClone(callback) {
        OLog.debug("UserDomainViewRight.jsx handleCloneUser")
        callback()
        UX.setLocked(["user-domain-view-left"], true)
        Meteor.call("cloneUser", this.props.user._id, (error, result) => {
            UX.notify(result, error)
            UX.iosMajorPush(null, null, "/user/" + result.userId, "RIGHT", "crossfade")
        })
    }

    handleDelete(callback) {
        OLog.debug("UserDomainViewRight.jsx handleDeleteUser")
        callback()
        UX.showModal(<RetireModal title={Util.i18n("common.label_retire_user")}
            collection={Meteor.users}
            _id={this.props.user._id}
            retireMethod="retireUser"
            sessionVariable="PUBLISH_AUTHORING_USER"/>)
    }
}
