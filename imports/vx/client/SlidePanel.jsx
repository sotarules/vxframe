import { Component } from "react"
import PropTypes from "prop-types"
import { Transition } from "react-transition-group"

export default class SlidePanel extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
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
                    return (
                        <div id={this.props.id}
                            className={VXApp.makeAnimationClasses(status, this.props.className, this.props.getAnimation())}>
                            {this.props.children}
                        </div>
                    )
                }}
            </Transition>
        )
    }
}
