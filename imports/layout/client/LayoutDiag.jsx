import { Component } from "react"
import { Provider } from "react-redux"

import PropTypes from "prop-types"
import OffCanvasNavContainer from "/imports/layout/client/OffCanvasNavContainer"
import TopBar from "/imports/layout/client/TopBar"
import VXAnchor from "/imports/vx/client/VXAnchor"
import NotAuthorizedPage from "/imports/notfound/client/NotAuthorizedPage"

export default class LayoutDiag extends Component {

    static propTypes = {
        isAuthorizedRoute : PropTypes.bool.isRequired,
        content : PropTypes.element.isRequired
    }

    render() {

        if (!this.props.isAuthorizedRoute) {
            return (
                <Provider store={Store}>
                    <div className="flexi-grow">
                        <OffCanvasNavContainer/>
                        <TopBar/>
                        <div className="nav-canvas flexi-grow">
                            <NotAuthorizedPage/>
                        </div>
                    </div>
                </Provider>
            )
        }

        return (
            <Provider store={Store}>
                <div className="background-black flexi-grow">
                    <OffCanvasNavContainer/>
                    <TopBar/>
                    <div className="nav-canvas notification-container diag-container flexi-grow">
                        {this.props.content}
                    </div>
                    <VXAnchor/>
                </div>
            </Provider>
        )
    }
}
