import { Component } from "react"
import PropTypes from "prop-types"
import SlidePairContainer from "/imports/vx/client/SlidePairContainer"
import LoadingSpinner from "/imports/vx/client/LoadingSpinner"
import TemplateViewLeftContainer from "/imports/templates/client/TemplateViewLeftContainer"
import TemplateViewRightContainer from "/imports/templates/client/TemplateViewRightContainer"

export default class TemplateView extends Component {

    static propTypes = {
        ready : PropTypes.bool.isRequired
    }

    render() {
        if (!this.props.ready) {
            return (<LoadingSpinner/>)
        }
        return (
            <SlidePairContainer leftPanel={(<TemplateViewLeftContainer/>)}
                rightPanel={(<TemplateViewRightContainer/>)}
                leftColumnCount={5}
                rightColumnCount={7}/>
        )
    }
}
