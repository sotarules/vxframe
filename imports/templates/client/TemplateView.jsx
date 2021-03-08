import {Component} from "react"
import SlidePairContainer from "/imports/vx/client/SlidePairContainer"
import TemplateViewLeftContainer from "/imports/templates/client/TemplateViewLeftContainer"
import TemplateViewRightContainer from "/imports/templates/client/TemplateViewRightContainer"

export default class TemplateView extends Component {
    render() {
        return (
            <SlidePairContainer leftPanel={(<TemplateViewLeftContainer/>)}
                rightPanel={(<TemplateViewRightContainer/>)}
                leftColumnCount={6}
                rightColumnCount={6}/>
        )
    }
}
