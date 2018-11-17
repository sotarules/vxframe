import { Component } from "react"
import PropTypes from "prop-types"
import RadioButtonGroup from "/imports/vx/client/RadioButtonGroup.jsx"
import RadioButton from "/imports/vx/client/RadioButton.jsx"
import UserEntityList from "/imports/vx/client/UserEntityList.jsx"
import BottomButton from "/imports/vx/client/BottomButton.jsx"

export default class UserDomainViewLeft extends Component {

    static PropTypes = {
        id : PropTypes.string.isRequired,
        users : PropTypes.array.isRequired
    }

    static defaultProps = {
        id : "user-domain-view-left"
    }

    constructor(props) {
        super(props)
        this.locked = false
        this.state = { usersDomainsButton : "button-users" }
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
                <RadioButtonGroup id="button-users-domains"
                        activeButtonId={this.state.usersDomainsButton}>
                    <RadioButton id="button-users"
                        text={Util.i18n("user_domain.label_users")}/>
                    <RadioButton id="button-domains"
                        text={Util.i18n("user_domain.label_domains")}
                        onClick={this.handleClickDomains.bind(this)}/>
                </RadioButtonGroup>
                <UserEntityList id="domain-user-view-left-list"
                    users={this.props.users}
                    selectable={true}
                    chevrons={true}
                    onSelect={this.handleSelectUser.bind(this)}/>
                <BottomButton id="button-create-user"
                    className="btn-primary"
                    text={Util.i18n("user_domain.button_create_user")}
                    onClick={this.handleClickCreateUser.bind(this)}/>
            </div>
        )
    }

    handleClickDomains() {
        OLog.debug("UserDomainViewLeft handleClickDomains")
        this.setState({ usersDomainsButton : "button-domains" }, () => {
            UX.iosInvoke(null, null, "/domains-users", "LEFT", "crossfade")
        })
    }

    handleSelectUser(event, component) {
        let currentRequest = {};
        currentRequest.criteria = { _id : component.props._id };
        OLog.debug("UserDomainViewLeft.jsx handleSelectUser will select new user currentRequest=" + OLog.debugString(currentRequest));
        Session.set("PUBLISH_AUTHORING_USER", currentRequest);
        if (UX.isSlideMode(true)) {
            UX.iosMinorPush("common.button_users", "RIGHT");
        }
    }

    handleClickCreateUser(callback) {
        callback()
        UX.setLocked(["user-domain-view-left", "user-domain-view-right"], true)
        Meteor.call("createUserDefault", (error, userId) => {
            if (error) {
                OLog.error("UserDomainViewLeft.jsx handleClickCreateUser error attempting to create user=" + error)
                UX.notifyForDatabaseError(error)
                return
            }
            UX.iosMajorPush(null, null, "/user/" + userId, "RIGHT", "crossfade")
        })
    }
}
