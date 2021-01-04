import { Component } from "react"
import SlidePairContainer from "/imports/vx/client/SlidePairContainer"
import FunctionViewLeftContainer from "/imports/functions/client/FunctionViewLeftContainer"
import FunctionViewRightContainer from "/imports/functions/client/FunctionViewRightContainer"

export default class FunctionView extends Component {
    render() {
        return (
            <SlidePairContainer leftPanel={(<FunctionViewLeftContainer/>)}
                rightPanel={(<FunctionViewRightContainer/>)}
                leftColumnCount={5}
                rightColumnCount={7}/>
        )
    }
}
