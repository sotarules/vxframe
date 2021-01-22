import { Component } from "react"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import LayoutWideConnect from "/imports/layout/client/LayoutWideConnect"

export default class LayoutWideContainer extends Component {
    render() {
        OLog.debug("LayoutWideContainer.jsx render")
        return (
            <Provider store={Store}>
                <PersistGate loading={null} persistor={Persistor}>
                    <LayoutWideConnect {...this.props} />
                </PersistGate>
            </Provider>
        )
    }
}

