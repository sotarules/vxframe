import { Component } from "react"

import PropTypes from "prop-types"
import TransitionGroup from "react-transition-group/TransitionGroup"
import OffCanvasNavContainer from "/imports/layout/client/OffCanvasNavContainer"
import TopBar from "/imports/layout/client/TopBar"
import NotAuthorizedPage from "/imports/notfound/client/NotAuthorizedPage"
import LoadingSpinner from "/imports/vx/client/LoadingSpinner"
import SlidePanel from "/imports/vx/client/SlidePanel"
import VXAnchor from "/imports/vx/client/VXAnchor"

export default class LayoutStandard extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        isAuthorizedRoute : PropTypes.bool.isRequired,
        content : PropTypes.element.isRequired,
        loading : PropTypes.bool
    }

    static defaultProps = {
        id : "vx-layout-standard"
    }

    constructor(props) {
        super(props)
        this.animation = null
    }

    render() {
        if (this.props.loading) {
            return (<LoadingSpinner/>)
        }
        if (!this.props.isAuthorizedRoute) {
            return (<NotAuthorizedPage/>)
        }
        return (
            <div id={this.props.id}
                className="flexi-grow">
                <OffCanvasNavContainer/>
                <TopBar/>
                <div className="container container-width-100 nav-canvas flexi-grow">
                    <div className="animation-top flexi-grow">
                        <div className="animation-container notification-container flexi-grow">
                            <TransitionGroup id="layout-transition-group" component="div" className="flexi-grow">
                                <SlidePanel key={this.slidePanelId()}
                                    id={this.slidePanelId()}
                                    className="animation-panel flexi-grow"
                                    getAnimation={this.getAnimation.bind(this)}>
                                    {this.props.content}
                                </SlidePanel>
                            </TransitionGroup>
                        </div>
                    </div>
                </div>
                <VXAnchor/>
            </div>
        )
    }

    slidePanelId() {
        return `layout-slide-panel-${this.props.content.type.name}`
    }

    getAnimation() {
        return this.animation
    }

    setAnimation(animation) {
        this.animation = animation
    }
}
