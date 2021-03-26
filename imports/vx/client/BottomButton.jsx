import { Component } from "react"
import PropTypes from "prop-types"
import VXButton from "/imports/vx/client/VXButton"

export default class BottomButton extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        title : PropTypes.string,
        className : PropTypes.string,
        onClick : PropTypes.func,
        text : PropTypes.string,
        iconClass : PropTypes.string,
        chevron : PropTypes.bool,
        minimumDuration : PropTypes.number
    }

    render() {
        return (
            <VXButton id={this.props.id}
                title={this.props.title}
                className={`btn btn-block btn-bottom ${this.props.className || ""}`}
                iconClass={this.props.iconClass}
                chevron={this.props.chevron}
                minimumDuration={this.props.minimumDuration}
                onClick={this.props.onClick ? this.props.onClick.bind(this) : null}>
                {this.props.text}
            </VXButton>
        )
    }
}
