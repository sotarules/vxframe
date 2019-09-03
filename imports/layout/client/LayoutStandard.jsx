import { Component } from "react"

import PropTypes from "prop-types"
import TransitionGroup from "react-transition-group/TransitionGroup"
import SlidePanel from "/imports/vx/client/SlidePanel"
import OffCanvasNavContainer from "/imports/layout/client/OffCanvasNavContainer"
import TopBar from "/imports/layout/client/TopBar"
import NotAuthorizedPage from "/imports/notfound/client/NotAuthorizedPage"
import LoadingSpinner from "/imports/vx/client/LoadingSpinner"
import VXAnchor from "/imports/vx/client/VXAnchor"

export default class LayoutStandard extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        isAuthorizedRoute : PropTypes.bool.isRequired,
        loading : PropTypes.bool
    }

    static defaultProps = {
        id : "vx-layout-standard"
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
                                    {this.props.children}
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
        return this.props.location.key || Util.routePath()
    }

    getAnimation() {
        return this.animation
    }

    setAnimation(animation) {
        this.animation = animation
    }
}
