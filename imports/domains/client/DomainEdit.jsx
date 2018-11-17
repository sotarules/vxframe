import { Component } from "react"
import SlidePairContainer from "/imports/vx/client/SlidePairContainer.jsx"
import DomainEditLeftContainer from "/imports/domains/client/DomainEditLeftContainer.jsx"
import DomainEditRightContainer from "/imports/domains/client/DomainEditRightContainer.jsx"

export default class DomainEdit extends Component {
    render() {
        return (
            <SlidePairContainer leftPanel={(<DomainEditLeftContainer/>)}
                rightPanel={(<DomainEditRightContainer/>)}
                leftColumnCount={5}
                rightColumnCount={7}/>
        )
    }
}
