import { Component } from "react"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import LayoutDiagConnect from "/imports/layout/client/LayoutDiagConnect"

export default class LayoutDiagContainer extends Component {
    render() {
        return (
            <Provider store={Store}>
                <PersistGate loading={null} persistor={Persistor}>
                    <LayoutDiagConnect {...this.props} />
                </PersistGate>
            </Provider>
        )
    }
}
