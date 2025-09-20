import {Component} from "react"
import PropTypes from "prop-types"
import OffCanvasNavItem from "./OffCanvasNavItem"
import OffCanvasNavSeparator from "./OffCanvasNavSeparator"
import AboutModal from "/imports/vx/client/AboutModal"
import DeploymentModal from "/imports/vx/client/DeploymentModal"

export default class OffCanvasNav extends Component {

    static propTypes = {
        isUserAdmin : PropTypes.bool.isRequired,
        isUserSuperAdmin : PropTypes.bool.isRequired,
        isEnableBrokerages : PropTypes.bool.isRequired
    }

    render() {
        return (
            <nav id="offcanvas-menu-react" className="navmenu navmenu-inverse navmenu-fixed-left offcanvas in" role="navigation" style={this.styles().offcanvasMenu}>
                <ul className="nav navmenu-nav scroll-y scroll-momentum">
                    <OffCanvasNavItem iconClass="fa-times"
                        text={Util.i18n("navbar.close_menu")}
                        onClick={this.onClickCloseMenu.bind(this)}/>
                    <OffCanvasNavItem iconClass="fa-dashboard"
                        text={Util.i18n("navbar.dashboard")}
                        path="/dashboard"/>
                    <OffCanvasNavItem iconClass="fa-folder-open"
                        text={Util.i18n("navbar.clients")}
                        path="/clients"/>
                    {this.props.isEnableCarriers &&
                        <OffCanvasNavItem iconClass="fa-institution"
                            text={Util.i18n("navbar.carriers")}
                            path="/carriers"/>
                    }
                    {this.props.isEnableBrokerages &&
                        <OffCanvasNavItem iconClass="fa-phone-square"
                            text={Util.i18n("navbar.brokerages")}
                            path="/brokerages"/>
                    }
                    <OffCanvasNavItem iconClass="fa-user-circle-o"
                        text={Util.i18n("navbar.vendors")}
                        path="/vendors"/>
                    <OffCanvasNavItem iconClass="fa-user-plus"
                        text={Util.i18n("navbar.prospects")}
                        path="/prospects"/>
                    {Util.isPermission("ACCESS_REPORTS") &&
                        <OffCanvasNavItem iconClass="fa-print"
                            text={Util.i18n("navbar.reports")}
                            path="/reports"/>
                    }
                    <OffCanvasNavSeparator/>
                    <OffCanvasNavItem iconClass="fa-cloud-upload"
                        text={Util.i18n("navbar.import")}
                        onClick={this.onClickImport.bind(this)}/>
                    {Util.isPermission("ACCESS_TASK_DEFINITIONS") &&
                        <OffCanvasNavItem iconClass="fa-calendar-o"
                            text={Util.i18n("navbar.task_definitions")}
                            path="/taskdefinitions"/>
                    }
                    {this.props.isUserSuperAdmin &&
                        <OffCanvasNavItem iconClass="fa-code"
                            text={Util.i18n("navbar.functions")}
                            path="/functions"/>
                    }
                    <OffCanvasNavSeparator/>
                    <OffCanvasNavItem iconClass="fa-user"
                        text={Util.i18n("navbar.profile")}
                        path="/profile"/>
                    <OffCanvasNavItem iconClass="fa-building-o"
                        text={Util.i18n("navbar.my_tenants")}
                        path="/tenants"/>
                    {this.props.isUserAdmin &&
                        <>
                            <OffCanvasNavItem iconClass="fa-sitemap"
                                text={Util.i18n("navbar.members_domains")}
                                path="/users-domains"/>
                            <OffCanvasNavSeparator/>
                            <OffCanvasNavItem iconClass="fa-upload"
                                text={Util.i18n("navbar.deployment")}
                                path="/domains-users"
                                onClick={this.onClickDeployment.bind(this)}/>

                        </>
                    }
                    {Util.isPermission("ACCESS_SETTINGS") &&
                        <OffCanvasNavItem iconClass="fa-gear"
                            text={Util.i18n("navbar.settings")}
                            path="/system-settings"/>
                    }
                    {this.props.isUserSuperAdmin &&
                        <>
                            <OffCanvasNavItem iconClass="fa-history"
                                text={Util.i18n("navbar.events")}
                                path="/events"/>
                            <OffCanvasNavItem iconClass="fa-database"
                                text={Util.i18n("navbar.log")}
                                path="/log"/>
                        </>
                    }
                    <OffCanvasNavSeparator/>
                    <OffCanvasNavItem iconClass="fa-graduation-cap"
                        text={Util.i18n("navbar.tutorials")}
                        path="/tutorials"/>
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
        if (UX.isTouchClick(event)) {
            OLog.debug("OffCanvasNav.jsx onClickCloseMenu *touchclick* ignored")
            return
        }
        UX.onClickCloseMenu(event)
    }

    onClickImport(event) {
        VXApp.handleClickImport(event)
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
