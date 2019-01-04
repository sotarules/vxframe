import { Component } from "react"
import NavList from "/imports/vx/client/NavList"
import NavItem from "/imports/vx/client/NavItem"

export default class ProfileNavList extends Component {

    render() {
        return (
            <NavList>
                <NavItem id="profile" iconClass="fa-user" text={Util.i18n("profile.tab_profile")} onSelect={this.handleSelect.bind(this)}/>
                <NavItem id="credentials" iconClass="fa-book" text={Util.i18n("profile.tab_credentials")} onSelect={this.handleSelect.bind(this)}/>
                <NavItem id="notifications" iconClass="fa-envelope" text={Util.i18n("profile.tab_notifications")} onSelect={this.handleSelect.bind(this)}/>
                <NavItem id="preferences" iconClass="fa-gear" text={Util.i18n("profile.tab_preferences")} onSelect={this.handleSelect.bind(this)}/>
                <NavItem id="reports" iconClass="fa-print" text={Util.i18n("profile.tab_reports")} onSelect={this.handleSelect.bind(this)}/>
            </NavList>
        )
    }

    handleSelect(event) {
        this.props.setProfileTab(event.target.id)
        UX.iosMinorPush("common.button_sections", "RIGHT")
    }
}
