import { Component } from "react"
import PropTypes from "prop-types"
import SlidePairContainer from "/imports/vx/client/SlidePairContainer.jsx"
import TemplateEditLeftContainer from "/imports/templates/client/TemplateEditLeftContainer.jsx"
import TemplateEditRightContainer from "/imports/templates/client/TemplateEditRightContainer.jsx"

export default class TemplateEdit extends Component {

    static propTypes = {
        ready : PropTypes.bool.isRequired
    }

    render() {
        if (!this.props.ready) {
            return null
        }
        return (
            <SlidePairContainer leftPanel={(<TemplateEditLeftContainer/>)}
                rightPanel={(<TemplateEditRightContainer/>)}
                leftColumnCount={5}
                rightColumnCount={7}/>
        )
    }
}
