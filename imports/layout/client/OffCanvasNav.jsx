import { Component } from "react"
import PropTypes from "prop-types"
import OffCanvasNavItem from "./OffCanvasNavItem"
import OffCanvasNavSeparator from "./OffCanvasNavSeparator"
import AboutModal from "/imports/vx/client/AboutModal"

export default class OffCanvasNav extends Component {

    static propTypes = {
        isUserAdmin : PropTypes.bool.isRequired,
        isUserSuperAdmin : PropTypes.bool.isRequired
    }

    render() {
        return (
            <nav id="offcanvas-menu-react" className="navmenu navmenu-inverse navmenu-fixed-left offcanvas in scroll-y scroll-momentum scroll-fix" role="navigation" style={this.styles().offcanvasMenu}>
                <ul className="nav navmenu-nav">
                    <OffCanvasNavItem iconClass="fa-user"
                        text={Util.i18n("navbar.profile")}
                        path="/profile"/>
                    <OffCanvasNavItem iconClass="fa-building-o"
                        text={Util.i18n("navbar.my_tenants")}
                        path="/tenants"/>
                    {this.props.isUserAdmin &&
                        <OffCanvasNavSeparator/>
                    }
                    {this.props.isUserAdmin &&
                        <OffCanvasNavItem iconClass="fa-file-code-o"
                            text={Util.i18n("navbar.templates")}
                            path="/templates"/>
                    }
                    {this.props.isUserAdmin &&
                        <OffCanvasNavItem iconClass="fa-sitemap"
                            text={Util.i18n("navbar.members_domains")}
                            path="/users-domains"/>
                    }
                    <hr className="nav-separator"/>
                    {this.props.isUserSuperAdmin &&
                        <OffCanvasNavItem iconClass="fa-gear"
                            text={Util.i18n("navbar.settings")}
                            path="/system-settings"/>
                    }
                    {this.props.isUserSuperAdmin &&
                        <OffCanvasNavItem iconClass="fa-history"
                            text={Util.i18n("navbar.events")}
                            path="/events"/>
                    }
                    {this.props.isUserSuperAdmin &&
                        <OffCanvasNavItem iconClass="fa-database"
                            text={Util.i18n("navbar.log")}
                            path="/log"/>
                    }
                    {this.props.isUserSuperAdmin &&
                        <OffCanvasNavSeparator/>
                    }
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

    onClickAbout(event) {
        UX.onClickAbout(event, <AboutModal/>)
    }

    onClickSignOut(event) {
        UX.onClickSignOut(event)
    }
}
