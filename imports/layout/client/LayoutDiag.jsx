import { Component } from "react"
import PropTypes from "prop-types"
import OffCanvasNavContainer from "/imports/layout/client/OffCanvasNavContainer.jsx"
import TopBar from "/imports/layout/client/TopBar.jsx"
import VXAnchor from "/imports/vx/client/VXAnchor.jsx"
import NotAuthorizedPage from "/imports/notfound/client/NotAuthorizedPage.jsx"

export default class LayoutDiag extends Component {

    static propTypes = {
        isAuthorizedRoute : PropTypes.bool.isRequired,
        content : PropTypes.element.isRequired
    }

    render() {

        if (!this.props.isAuthorizedRoute) {
            return (
                <div className="flexi-grow">
                    <OffCanvasNavContainer/>
                    <TopBar/>
                    <div className="nav-canvas flexi-grow">
                        <NotAuthorizedPage/>
                    </div>
                </div>
            )
        }

        return (
            <div className="background-black flexi-grow">
                <OffCanvasNavContainer/>
                <TopBar/>
                <div className="nav-canvas notification-container diag-container flexi-grow">
                    {this.props.content}
                </div>
                <VXAnchor/>
            </div>
        )
    }
}
