import { Component } from "react"
import PropTypes from "prop-types"
import TransitionGroup from "react-transition-group/TransitionGroup"
import SlidePanel from "/imports/vx/client/SlidePanel"

export default class Wizard extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired
    }

    static defaultProps = {
        id : "vx-wizard"
    }

    constructor(props) {
        super(props)
        this.animation = null
    }

    render() {
        return (
            <div id={this.props.id} className="flexi-grow">
                <TransitionGroup component="div" className="flexi-grow">
                    {this.renderPanels()}
                </TransitionGroup>
            </div>
        )
    }

    renderPanels() {
        return (
            <SlidePanel id="wizard-slide-panel"
                className="wizard-container animation-panel not-selectable flexi-grow"
                getAnimation={this.getAnimation.bind(this)}>
                {this.props.children}
            </SlidePanel>
        )
    }

    getAnimation() {
        return this.animation
    }

    setAnimation(animation) {
        this.animation = animation
    }
}
