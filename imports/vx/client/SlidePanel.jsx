import { Component } from "react"
import PropTypes from "prop-types"
import Transition from "react-transition-group/Transition"

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
                addEndListener={this.handleEnd.bind(this)}
                timeout={this.timeout()}>
                {(status) => {
                    return (
                        <div id={this.props.id} className={this.makeClasses(status)}>
                            {this.props.children}
                        </div>
                    )
                }}
            </Transition>
        )
    }

    handleEnd(node, done) {
        $(node).one("webkitAnimationEnd oanimationend msAnimationEnd animationend", () => {
            UX.afterAnimate()
            done()
        })
    }

    timeout() {
        return this.props.getAnimation() ? 550 : 1
    }

    makeClasses(status) {

        let classes = this.props.className
        let animation = this.props.getAnimation()

        if (animation) {
            switch (status) {
            case "entering" :
                classes += " " + animation + "-enter"
                break
            case "entered" :
                classes += " " + animation + "-enter " + animation + "-enter-active"
                break
            case "exiting" :
                classes += " " + animation + "-exit"
                break
            case "exited" :
                classes += " " + animation + "-exit " + animation + "-exit-active"
                break
            }
        }

        return classes
    }
}
