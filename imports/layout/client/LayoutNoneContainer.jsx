import { Component } from "react"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import LayoutNoneConnect from "/imports/layout/client/LayoutNoneConnect"

export default class LayoutNoneContainer extends Component {
    render() {
        return (
            <Provider store={Store}>
                <PersistGate loading={null} persistor={Persistor}>
                    <LayoutNoneConnect {...this.props} />
                </PersistGate>
            </Provider>
        )
    }
}

