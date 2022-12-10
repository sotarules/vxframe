import {Component} from "react"
import PropTypes from "prop-types"
import OffCanvasNavItem from "./OffCanvasNavItem"
import OffCanvasNavSeparator from "./OffCanvasNavSeparator"
import AboutModal from "/imports/vx/client/AboutModal"
import DeploymentModal from "/imports/vx/client/DeploymentModal"

export default class OffCanvasNav extends Component {

    static propTypes = {
        isUserAdmin : PropTypes.bool.isRequired,
        isUserSuperAdmin : PropTypes.bool.isRequired
    }

    render() {
        return (
            <nav id="offcanvas-menu-react" className="navmenu navmenu-inverse navmenu-fixed-left offcanvas in scroll-y scroll-momentum" role="navigation" style={this.styles().offcanvasMenu}>
                <ul className="nav navmenu-nav">
                    <OffCanvasNavItem iconClass="fa-times"
                        text={Util.i18n("navbar.close_menu")}
                        onClick={this.onClickCloseMenu.bind(this)}/>
                    <OffCanvasNavItem iconClass="fa-print"
                        text={Util.i18n("navbar.reports")}
                        path="/reports"/>
                    <OffCanvasNavItem iconClass="fa-user"
                        text={Util.i18n("navbar.profile")}
                        path="/profile"/>
                    <OffCanvasNavItem iconClass="fa-building-o"
                        text={Util.i18n("navbar.my_tenants")}
                        path="/tenants"/>

                    {this.props.isUserAdmin &&
                        <>
                            <OffCanvasNavSeparator/>
                            <OffCanvasNavItem iconClass="fa-file-code-o"
                                text={Util.i18n("navbar.templates")}
                                path="/templates"/>
                            <OffCanvasNavItem iconClass="fa-code"
                                text={Util.i18n("navbar.functions")}
                                path="/functions"/>
                            <OffCanvasNavItem iconClass="fa-sitemap"
                                text={Util.i18n("navbar.members_domains")}
                                path="/users-domains"/>
                        </>
                    }
                    {this.props.isUserAdmin &&
                        <>
                            <OffCanvasNavSeparator/>
                            <OffCanvasNavItem iconClass="fa-upload"
                                text={Util.i18n("navbar.deployment")}
                                path="/domains-users"
                                onClick={this.onClickDeployment.bind(this)}/>
                            <OffCanvasNavSeparator/>
                            <OffCanvasNavItem iconClass="fa-gear"
                                text={Util.i18n("navbar.settings")}
                                path="/system-settings"/>
                            <OffCanvasNavItem iconClass="fa-history"
                                text={Util.i18n("navbar.events")}
                                path="/events"/>
                            <OffCanvasNavItem iconClass="fa-database"
                                text={Util.i18n("navbar.log")}
                                path="/log"/>
                        </>
                    }
                    <OffCanvasNavSeparator/>
                    <OffCanvasNavItem iconClass="fa-info-circle"
                        text={Util.i18n("navbar.about")}
                        onClick={this.onClickAbout.bind(this)}/>
                    <OffCanvasNavItem iconClass="fa-power-off"
                        text={Util.i18n("navbar.signout")}
                        onClick={this.onClickSignOut.bind(this)}/>
                </ul>
            </nav>
        )
    }

    styles() {
        return {
            offcanvasMenu : { left : "-200px" }
        }
    }

    onClickCloseMenu(event) {
        UX.onClickCloseMenu(event)
    }

    onClickDeployment(event) {
        event.persist()
        const delayMilliseconds = Util.isRoutePath("domains-users") ? 0 : 2000
        UX.onClickMenuItem(event)
        Meteor.setTimeout(() => {
            UX.onClickDeployment(event, <DeploymentModal/>)
        }, delayMilliseconds)
    }

    onClickAbout(event) {
        UX.onClickAbout(event, <AboutModal/>)
    }

    onClickSignOut(event) {
        UX.onClickSignOut(event)
    }
}
