import { Component } from "react"
import SlidePairContainer from "/imports/vx/client/SlidePairContainer"
import DomainEditLeftContainer from "/imports/domains/client/DomainEditLeftContainer"
import DomainEditRightContainer from "/imports/domains/client/DomainEditRightContainer"

export default class DomainEdit extends Component {
    render() {
        return (
            <SlidePairContainer leftPanel={(<DomainEditLeftContainer/>)}
                rightPanel={(<DomainEditRightContainer/>)}
                leftColumnCount={6}
                rightColumnCount={6}/>
        )
    }
}
