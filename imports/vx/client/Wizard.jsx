import { Component } from "react"
import PropTypes from "prop-types"
import TransitionGroup from "react-transition-group/TransitionGroup"

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
                    {this.props.children}
                </TransitionGroup>
            </div>
        )
    }

    getAnimation() {
        return this.animation
    }

    setAnimation(animation) {
        this.animation = animation
    }
}
