import { Component } from "react"
import PropTypes from "prop-types"
import OffCanvasNavContainer from "/imports/layout/client/OffCanvasNavContainer"
import TopBar from "/imports/layout/client/TopBar"
import VXAnchor from "/imports/vx/client/VXAnchor"
import LoadingSpinner from "/imports/vx/client/LoadingSpinner"
import NotAuthorizedPage from "/imports/notfound/client/NotAuthorizedPage"

export default class LayoutDiag extends Component {

    static propTypes = {
        isAuthorizedRoute : PropTypes.bool.isRequired,
        content : PropTypes.element.isRequired,
        loading : PropTypes.bool
    }

    render() {
        if (this.props.loading) {
            return (<LoadingSpinner/>)
        }
        if (!this.props.isAuthorizedRoute) {
            return (<NotAuthorizedPage/>)
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
