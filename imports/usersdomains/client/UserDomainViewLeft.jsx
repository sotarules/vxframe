import { Component } from "react"
import PropTypes from "prop-types"
import RadioButtonGroup from "/imports/vx/client/RadioButtonGroup"
import RadioButton from "/imports/vx/client/RadioButton"
import UserEntityList from "/imports/vx/client/UserEntityList"
import BottomButton from "/imports/vx/client/BottomButton"
import { setPublishAuthoringUser } from "/imports/vx/client/code/actions"

export default class UserDomainViewLeft extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        users : PropTypes.array.isRequired
    }

    static defaultProps = {
        id : "user-domain-view-left"
    }

    constructor(props) {
        super(props)
        this.locked = false
        this.state = { usersDomainsButton : "USERS" }
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
                    value={this.state.usersDomainsButton}>
                    <RadioButton id="button-users"
                        text={Util.i18n("user_domain.label_users")}
                        value="USERS"/>
                    <RadioButton id="button-domains"
                        text={Util.i18n("user_domain.label_domains")}
                        value="DOMAINS"
                        onClick={this.handleClickDomains.bind(this)}/>
                </RadioButtonGroup>
                <UserEntityList id="user-domain-view-left-list"
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
        Store.dispatch(setPublishAuthoringUser(VXApp.simplePublishingRequest(component.props.itemId)))
        if (UX.isSlideMode()) {
            UX.iosMinorPush("common.button_users", "RIGHT");
        }
    }

    handleClickCreateUser(callback) {
        callback()
        UX.setLocked(["user-domain-view-left", "user-domain-view-right"], true)
        Meteor.call("createUserDefault", (error, userId) => {
            if (error) {
                OLog.error(`UserDomainViewLeft.jsx handleClickCreateUser error attempting to create user=${OLog.errorError(error)}`)
                UX.notifyForDatabaseError(error)
                return
            }
            Store.dispatch(setPublishAuthoringUser(VXApp.simplePublishingRequest(userId)))
            UX.iosMajorPush(null, null, "/user", "RIGHT", "crossfade")
        })
    }
}
