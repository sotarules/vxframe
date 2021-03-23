import { Component } from "react"

export default class TopBarBurgerButton extends Component {

    render() {
        return (
            <td className="nav-cell-burger">
                <div className="navbar-toggle-container"
                    onClick={this.handleClick.bind(this)}
                    onTouchStart={this.handleTouchStart.bind(this)}>
                    <button type="button" className="navbar-toggle navbar-burger-button">
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                    </button>
                </div>
            </td>
        )
    }

    handleClick(event) {
        if (UX.isTouchClick(event)) {
            OLog.debug("TopBarBurgerButton.jsx handleClick *touchclick* ignored")
            return
        }
        this.conditionallyReset(event)
    }

    handleTouchStart(event) {
        UX.armTouchClick(event)
        this.conditionallyReset(event)
    }

    conditionallyReset() {
        // event.preventDefault()
        if ($("#offcanvas-menu-react").hasClass("navslide-show")) {
            OLog.debug("TopBarBurgerButton.jsx conditionallyReset nav is currently showing, queue reset nav")
            $("#offcanvas-menu-react").one("animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd", () => {
                $("#offcanvas-menu-react").off("animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd")
                OLog.debug("TopBarBurgerButton.jsx conditionallyReset reset nav *fire*")
                UX.resetNav()
            })
        }
        UX.toggleNav()
    }
}
