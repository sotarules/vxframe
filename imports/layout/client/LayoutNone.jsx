import { Component } from "react"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"

import PropTypes from "prop-types"
import VXAnchor from "/imports/vx/client/VXAnchor"

export default class LayoutNone extends Component {

    static propTypes = {
        content : PropTypes.element.isRequired
    }

    render() {
        return (
            <Provider store={Store}>
                <PersistGate loading={null} persistor={Persistor}>
                    <div className="flexi-grow overflow-hidden">
                        {this.props.content}
                        <VXAnchor/>
                    </div>
                </PersistGate>
            </Provider>
        )
    }
}
