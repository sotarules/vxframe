import { Component } from "react"
import SlidePairContainer from "/imports/vx/client/SlidePairContainer"
import TenantViewLeftContainer from "/imports/tenants/client/TenantViewLeftContainer"
import TenantViewRightContainer from "/imports/tenants/client/TenantViewRightContainer"

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
