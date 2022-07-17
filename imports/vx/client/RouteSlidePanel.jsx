import { Component } from "react"
import PropTypes from "prop-types"
import { Switch } from "react-router-dom"
import { Transition } from "react-transition-group"

export default class RouteSlidePanel extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        location : PropTypes.object.isRequired,
        className : PropTypes.string.isRequired,
        getAnimation : PropTypes.func.isRequired,
        in : PropTypes.bool
    }

    render() {
        return (
            <Transition in={this.props.in}
                unmountOnExit={true}
                addEndListener={VXApp.handleAnimationEnd.bind(this)}
                timeout={VXApp.animationTimeout(this.props.getAnimation())}>
                {(status) => {
                    OLog.debug(`RouteSlidePanel.jsx render id=${this.props.id} key=${this.props.location.key} pathname=${this.props.location.pathname} ` +
                        `in=${this.props.in} status=${status} animation=${this.props.getAnimation()} ` +
                        `classes=${this.animationClasses(status)}`)
                    return (
                        <div id={this.props.id}
                            className={this.animationClasses(status)}>
                            <Switch location={this.props.location}>
                                {this.props.children}
                            </Switch>
                        </div>
                    )
                }}
            </Transition>
        )
    }

    animationClasses(status) {
        return VXApp.makeAnimationClasses(status, this.props.className, this.props.getAnimation())
    }
}
