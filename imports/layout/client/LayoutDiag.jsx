import { Component } from "react"
import PropTypes from "prop-types"
import OffCanvasNavContainer from "/imports/layout/client/OffCanvasNavContainer"
import TopBar from "/imports/layout/client/TopBar"
import VXAnchor from "/imports/vx/client/VXAnchor"
import LoadingSpinner from "/imports/vx/client/LoadingSpinner"
import NotAuthorizedPage from "/imports/notfound/client/NotAuthorizedPage"

export default class LayoutDiag extends Component {

    static propTypes = {
        exemptRoute : PropTypes.bool,
        authorizedRoute : PropTypes.bool,
        loading : PropTypes.bool
    }

    render() {
        if (this.props.loading) {
            return (<LoadingSpinner/>)
        }
        return (
            <div className="background-black flexi-grow">
                <OffCanvasNavContainer/>
                <TopBar/>
                <div className="nav-canvas notification-container diag-container flexi-grow">
                    {this.props.authorizedRoute ? this.props.children : (<NotAuthorizedPage/>)}
                </div>
                <VXAnchor/>
            </div>
        )
    }
}
