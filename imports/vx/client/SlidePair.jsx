import { Component } from "react"
import PropTypes from "prop-types"
import { TransitionGroup } from "react-transition-group"
import IOSButtonBarContainer from "/imports/layout/client/IOSButtonBarContainer"
import SlidePanel from "/imports/vx/client/SlidePanel"

export default class SlidePair extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        name : PropTypes.string,
        leftPanel : PropTypes.element.isRequired,
        rightPanel : PropTypes.element.isRequired,
        leftColumnCount : PropTypes.number.isRequired,
        rightColumnCount : PropTypes.number.isRequired,
        iosState : PropTypes.object.isRequired
    }

    static defaultProps = {
        id : "vx-slide-pair"
    }

    render() {
        return (
            <div id={this.props.id} className="flexi-grow">
                <TransitionGroup id={`transition-group-${this.props.id}`} className="flexi-grow">
                    {!this.props.iosState.slideMode ? this.renderStandard() : this.renderSlide()}
                </TransitionGroup>
            </div>
        )
    }

    renderStandard() {
        return (
            <SlidePanel id="both-panels"
                key="both-panels"
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
        let routeSegmentFirst = Util.routeFirstSegment(Util.routePath())
        let panel = this.props.iosState.panelMap ?
            this.props.iosState.panelMap[routeSegmentFirst] :
            VXApp.getInitialPanel(Util.routePath())
        if (panel === "LEFT") {
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
        if (panel === "RIGHT") {
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
