import { Component } from "react"
import NavList from "/imports/vx/client/NavList.jsx"
import NavItem from "/imports/vx/client/NavItem.jsx"

export default class SettingsNavList extends Component {

    render() {
        return (
            <NavList>
                <NavItem id="system" iconClass="fa-gear" text={Util.i18n("system_settings.tab_system")} onSelect={this.handleSelect.bind(this)}/>
                <NavItem id="tenant" iconClass="fa-building-o" text={Util.i18n("system_settings.tab_tenant")} onSelect={this.handleSelect.bind(this)}/>
                <NavItem id="domain" iconClass="fa-sitemap" text={Util.i18n("system_settings.tab_domain")} onSelect={this.handleSelect.bind(this)}/>
            </NavList>
        )
    }

    handleSelect(event) {
        this.props.setSettingsTab(event.target.id)
        UX.iosMinorPush("common.button_sections", "RIGHT")
    }
}
