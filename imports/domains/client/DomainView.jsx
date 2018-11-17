import { Component } from "react"
import SlidePairContainer from "/imports/vx/client/SlidePairContainer.jsx"
import DomainViewLeftContainer from "/imports/domains/client/DomainViewLeftContainer.jsx"
import DomainViewRightContainer from "/imports/domains/client/DomainViewRightContainer.jsx"

export default class DomainView extends Component {

    render() {
        return (
            <SlidePairContainer name="DomainView.jsx"
                leftPanel={(<DomainViewLeftContainer/>)}
                rightPanel={(<DomainViewRightContainer/>)}
                leftColumnCount={5}
                rightColumnCount={7}/>
        )
    }
}
