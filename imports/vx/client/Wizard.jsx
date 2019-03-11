import { Component } from "react"
import PropTypes from "prop-types"
import TransitionGroup from "react-transition-group/TransitionGroup"
import SlidePanel from "/imports/vx/client/SlidePanel"

export default class Wizard extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        wizardState : PropTypes.object.isRequired,
        name : PropTypes.string,
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
        if (this.props.wizardState.currentIndex == null) {
            return null
        }
        let panelCount = React.Children.count(this.props.children)
        let wizardState = { panelCount : panelCount, ...this.props.wizardState }
        let wizardPanel = React.cloneElement(React.Children.toArray(this.props.children)[this.props.wizardState.currentIndex], { wizardState : wizardState })
        return (
            <SlidePanel id={"slide-panel-" + wizardPanel.props.id}
                key={"slide-panel-" + wizardPanel.props.id}
                className="wizard-container animation-panel not-selectable flexi-grow"
                getAnimation={this.getAnimation.bind(this)}>
                {wizardPanel}
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
