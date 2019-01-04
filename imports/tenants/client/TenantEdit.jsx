import { Component } from "react"
import SlidePairContainer from "/imports/vx/client/SlidePairContainer"
import TenantEditLeftContainer from "/imports/tenants/client/TenantEditLeftContainer"
import TenantEditRightContainer from "/imports/tenants/client/TenantEditRightContainer"

export default class TenantEdit extends Component {
    render() {
        return (
            <SlidePairContainer leftPanel={(<TenantEditLeftContainer/>)}
                rightPanel={(<TenantEditRightContainer/>)}
                leftColumnCount={5}
                rightColumnCount={7}/>
        )
    }
}
