import { Component } from "react"
import SlidePairContainer from "/imports/vx/client/SlidePairContainer"
import DomainViewLeftContainer from "/imports/domains/client/DomainViewLeftContainer"
import DomainViewRightContainer from "/imports/domains/client/DomainViewRightContainer"

export default class DomainView extends Component {

    render() {
        return (
            <SlidePairContainer leftPanel={(<DomainViewLeftContainer/>)}
                rightPanel={(<DomainViewRightContainer/>)}
                leftColumnCount={5}
                rightColumnCount={7}/>
        )
    }
}
