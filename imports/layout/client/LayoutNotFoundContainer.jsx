import { Component } from "react"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import LayoutNotFound from "/imports/layout/client/LayoutNotFound"

export default class LayoutNotFoundContainer extends Component {
    render() {
        OLog.debug("LayoutNotFoundContainer.jsx render")
        return (
            <Provider store={Store}>
                <PersistGate loading={null} persistor={Persistor}>
                    <LayoutNotFound {...this.props} />
                </PersistGate>
            </Provider>
        )
    }
}
