import { Component } from "react"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import LayoutStandardConnect from "/imports/layout/client/LayoutStandardConnect"

export default class LayoutStandardContainer extends Component {
    render() {
        OLog.debug("LayoutStandardContainer.jsx render")
        return (
            <Provider store={Store}>
                <PersistGate loading={null} persistor={Persistor}>
                    <LayoutStandardConnect {...this.props} />
                </PersistGate>
            </Provider>
        )
    }
}

