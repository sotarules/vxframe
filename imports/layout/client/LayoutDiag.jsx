import { Component } from "react"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"

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
                    <PersistGate loading={null} persistor={Persistor}>
                        <div className="flexi-grow">
                            <OffCanvasNavContainer/>
                            <TopBar/>
                            <div className="nav-canvas flexi-grow">
                                <NotAuthorizedPage/>
                            </div>
                        </div>
                    </PersistGate>
                </Provider>
            )
        }

        return (
            <Provider store={Store}>
                <PersistGate loading={null} persistor={Persistor}>
                    <div className="background-black flexi-grow">
                        <OffCanvasNavContainer/>
                        <TopBar/>
                        <div className="nav-canvas notification-container diag-container flexi-grow">
                            {this.props.content}
                        </div>
                        <VXAnchor/>
                    </div>
                </PersistGate>
            </Provider>
        )
    }
}
