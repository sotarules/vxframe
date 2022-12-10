import { Component } from "react"
import PropTypes from "prop-types"
import RadioButtonGroup from "/imports/vx/client/RadioButtonGroup"
import RadioButton from "/imports/vx/client/RadioButton"
import DomainEntityList from "/imports/vx/client/DomainEntityList"
import BottomButton from "/imports/vx/client/BottomButton"
import { setPublishAuthoringDomain } from "/imports/vx/client/code/actions"

export default class DomainUserViewLeft extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        domains : PropTypes.array.isRequired
    }

    static defaultProps = {
        id : "domain-user-view-left"
    }

    constructor(props) {
        super(props)
        this.locked = false
        this.state = { usersDomainsButton : "DOMAINS" }
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
                        value="USERS"
                        onClick={this.handleClickUsers.bind(this)}/>
                    <RadioButton id="button-domains"
                        text={Util.i18n("user_domain.label_domains")}
                        value="DOMAINS"/>
                </RadioButtonGroup>
                <DomainEntityList id="domain-user-view-left-list"
                    domains={this.props.domains}
                    selectable={true}
                    chevrons={true}
                    onSelect={this.handleSelectDomain.bind(this)}/>
                <BottomButton id="button-create-domain"
                    className="btn-primary"
                    text={Util.i18n("user_domain.button_create_domain")}
                    onClick={this.handleClickCreateDomain.bind(this)}/>
            </div>
        )
    }

    handleClickUsers() {
        OLog.debug("DomainUserViewLeft handleClickUsers")
        this.setState({ usersDomainsButton : "button-users" }, () => {
            UX.iosInvoke(null, null, "/users-domains", "LEFT", "crossfade")
        })
    }

    handleSelectDomain(event, component) {
        Store.dispatch(setPublishAuthoringDomain(VXApp.simplePublishingRequest(component.props.itemId)))
        if (UX.isSlideMode()) {
            UX.iosMinorPush("common.button_domains", "RIGHT");
        }
    }

    handleClickCreateDomain(callback) {
        UX.setLocked(["domain-user-view-left", "domain-user-view-right"], true)
        Meteor.setTimeout(() => {
            Domains.insert({ tenant: Util.getCurrentTenantId(Meteor.userId()) }, (error, domainId) => {
                if (error) {
                    callback()
                    UX.notifyForDatabaseError(error)
                    OLog.error(`UserDomainViewLeft.jsx handleClickCreateDomain error attempting to create domain=${OLog.errorError(error)}`)
                    return
                }
                Store.dispatch(setPublishAuthoringDomain(VXApp.simplePublishingRequest(domainId)))
                VXApp.refreshGlobalSubscriptions(() => {
                    callback()
                    UX.iosMajorPush(null, null, "/domain", "RIGHT", "crossfade")
                })
            })
        })
    }
}
