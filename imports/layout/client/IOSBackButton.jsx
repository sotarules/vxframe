import { Component } from "react";
import PropTypes from "prop-types";

export default class IOSBackButton extends Component {

    static propTypes = {
        backLabel : PropTypes.string.isRequired
    }

    render() {
        return (
            <div className="ios-button-group-back pull-left" onClick={this.handleClickBack.bind(this)}>
                <div className="ios-button-back ios-button-group-combo ios-button-link fade-ios">
                    <span className="ios-button-back fa fa-chevron-left"></span>
                    <span className="ios-button-text">{this.props.backLabel}</span>
                </div>
                <div className="ios-button-group-back-hotzone"></div>
            </div>
        )
    }

    handleClickBack() {
        if (UX.iosIsDisabled(".ios-button-back.ios-button-link")) {
            return
        }
        UX.iosDisable(".ios-button-back.ios-button-link")
        UX.iosPopAndGo()
    }
}
