import { Component } from "react"
import SlidePairContainer from "/imports/vx/client/SlidePairContainer.jsx"
import TenantViewLeftContainer from "/imports/tenants/client/TenantViewLeftContainer.jsx"
import TenantViewRightContainer from "/imports/tenants/client/TenantViewRightContainer.jsx"

export default class TenantView extends Component {

    render() {
        return (
            <SlidePairContainer leftPanel={(<TenantViewLeftContainer/>)}
                rightPanel={(<TenantViewRightContainer/>)}
                leftColumnCount={5}
                rightColumnCount={7}/>
        )
    }
}
