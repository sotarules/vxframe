import { Component } from "react"
import PropTypes from "prop-types"
import VXButton from "./VXButton"

export default class BigButton extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        className : PropTypes.string,
        onClickButton : PropTypes.func,
        buttonText : PropTypes.string,
        iconClass : PropTypes.string,
        iconStacked : PropTypes.bool
    }

    render() {
        return (
            <VXButton id={this.props.id}
                className={`btn big-button ${this.props.className || ""}`}
                iconClass={this.props.iconClass}
                iconStacked={this.props.iconStacked}
                onClick={this.props.onClickButton}>
                {this.props.buttonText}
            </VXButton>
        )
    }
}
