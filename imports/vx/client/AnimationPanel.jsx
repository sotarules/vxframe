import { Component } from "react"
import PropTypes from "prop-types"
import Transition from "react-transition-group/Transition"

export default class AnimationPanel extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        className : PropTypes.string.isRequired,
        getAnimation : PropTypes.func.isRequired,
        onEndAnimation : PropTypes.func,
        in : PropTypes.bool
    }

    render() {
        return (
            <Transition in={this.props.in}
                unmountOnExit={true}
                addEndListener={this.handleAnimationEnd.bind(this)}
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

    handleAnimationEnd(node, callback) {
        $(node).one("webkitAnimationEnd oanimationend msAnimationEnd animationend", () => {
            if (this.onEndAnimation) {
                this.onEndAnimation(this)
            }
            callback()
        })
    }
}
