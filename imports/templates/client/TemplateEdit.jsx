import {Component} from "react"
import SlidePairContainer from "/imports/vx/client/SlidePairContainer"
import TemplateEditLeftContainer from "/imports/templates/client/TemplateEditLeftContainer"
import TemplateEditRightContainer from "/imports/templates/client/TemplateEditRightContainer"

export default class TemplateEdit extends Component {
    render() {
        return (
            <SlidePairContainer leftPanel={(<TemplateEditLeftContainer/>)}
                rightPanel={(<TemplateEditRightContainer/>)}
                leftColumnCount={5}
                rightColumnCount={7}/>
        )
    }
}
