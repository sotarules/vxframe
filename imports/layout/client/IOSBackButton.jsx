import { Component } from "react";
import PropTypes from "prop-types";

export default class IOSBackButton extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        backLabel : PropTypes.string.isRequired
    }

    render() {
        return (
            <div id={this.props.id}
                className="ios-button-group-back pull-left"
                onClick={this.handleClickBack.bind(this)}>
                <div className="ios-button-back ios-button-group-combo ios-button-link">
                    <span className="ios-button-back fa fa-chevron-left"></span>
                    <span className="ios-button-text">{this.props.backLabel}</span>
                </div>
                <div className="ios-button-group-back-hotzone"></div>
            </div>
        )
    }

    handleClickBack(event) {
        OLog.debug(`IOSBackButton.jsx handleClick id=${this.props.id}`)
        UX.iosDisable("#" + this.props.id)
        if (_.isFunction(UXState[this.props.id])) {
            OLog.debug("IOSBackButton.jsx id=" + this.props.id + " invoking delegate")
            UXState[this.props.id](() => {
                UX.iosEnable("#" + this.props.id)
            }, event, this)
            return
        }
        UX.iosPopAndGo()
    }
}
