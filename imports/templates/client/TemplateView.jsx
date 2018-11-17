import { Component } from "react"
import PropTypes from "prop-types"
import SlidePairContainer from "/imports/vx/client/SlidePairContainer.jsx"
import TemplateViewLeftContainer from "/imports/templates/client/TemplateViewLeftContainer.jsx"
import TemplateViewRightContainer from "/imports/templates/client/TemplateViewRightContainer.jsx"

export default class TemplateView extends Component {

    static propTypes = {
        ready : PropTypes.bool.isRequired
    }

    render() {
        if (!this.props.ready) {
            return null
        }
        return (
            <SlidePairContainer leftPanel={(<TemplateViewLeftContainer/>)}
                rightPanel={(<TemplateViewRightContainer/>)}
                leftColumnCount={5}
                rightColumnCount={7}/>
        )
    }
}
