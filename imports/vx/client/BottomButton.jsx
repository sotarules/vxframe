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
        minimumDuration : PropTypes.number
    }

    render() {
        return (
            <div className="btn-bottom-container flex-section-fixed">
                <VXButton id={this.props.id}
                    title={this.props.title}
                    className={`btn btn-block btn-bottom ${this.props.className || ""}`}
                    iconClass={this.props.iconClass}
                    minimumDuration={this.props.minimumDuration}
                    onClick={this.props.onClick ? this.props.onClick.bind(this) : null}>
                    {this.props.text}
                </VXButton>
            </div>
        )
    }
}
