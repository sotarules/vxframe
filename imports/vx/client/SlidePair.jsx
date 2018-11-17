import { Component } from "react"
import PropTypes from "prop-types"
import TransitionGroup from "react-transition-group/TransitionGroup"
import IOSButtonBarContainer from "/imports/layout/client/IOSButtonBarContainer.jsx"
import SlidePanel from "/imports/vx/client/SlidePanel.jsx"

export default class SlidePair extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        name : PropTypes.string,
        leftPanel : PropTypes.element.isRequired,
        rightPanel : PropTypes.element.isRequired,
        leftColumnCount : PropTypes.number.isRequired,
        rightColumnCount : PropTypes.number.isRequired,
        slideMode : PropTypes.bool
    }

    static defaultProps = {
        id : "vx-slide-pair"
    }

    constructor(props) {
        super(props)
        this.date = new Date()
        this.animation = null
    }

    render() {
        return (
            <div id={this.props.id} className="flexi-grow">
                <TransitionGroup component="div" className="flexi-grow">
                    {this.renderStandard()}
                    {this.renderSlide()}
                </TransitionGroup>
            </div>
        )
    }

    renderStandard() {
        if (this.props.slideMode) {
            return null
        }
        return (
            <SlidePanel key="both-panels"
                id="both-panels"
                className="animation-panel not-selectable flexi-grow"
                getAnimation={this.getAnimation.bind(this)}>
                <IOSButtonBarContainer/>
                <div className="row conserve-space fill">
                    <div className={this.leftColumnClasses()}>
                    {this.props.leftPanel}
                    </div>
                    <div className={this.rightColumnClasses()}>
                    {this.props.rightPanel}
                    </div>
                </div>
            </SlidePanel>
        )
    }

    renderSlide() {
        if (!this.props.slideMode) {
            return null
        }
        if (this.props.panel === "LEFT") {
            return (
                <SlidePanel key="left-panel"
                    id="left-panel"
                    className="animation-panel not-selectable flexi-grow"
                    getAnimation={this.getAnimation.bind(this)}>
                    <IOSButtonBarContainer/>
                    {this.props.leftPanel}
                </SlidePanel>
            )
        }
        if (this.props.panel === "RIGHT") {
            return (
                <SlidePanel key="right-panel"
                    id="right-panel"
                    className="animation-panel not-selectable flexi-grow"
                    getAnimation={this.getAnimation.bind(this)}>
                    <IOSButtonBarContainer/>
                    {this.props.rightPanel}
                </SlidePanel>
            )
        }
    }

    getAnimation() {
        return this.animation
    }

    setAnimation(animation) {
        this.animation = animation
    }

    leftColumnClasses() {
        return "col-sm-" + this.props.leftColumnCount + " fill"
    }

    rightColumnClasses() {
        return "col-sm-" + this.props.rightColumnCount + " fill"
    }
}
