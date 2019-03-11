import { Component } from "react";
import PropTypes from "prop-types";

export default class WizardBody extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        className : PropTypes.string,
        thinPaddingTop : PropTypes.bool
    }

    static defaultProps = {
        id : "wizard-body"
    }

    render() {
        return (
            <div id={this.props.id} className={`wizard-body ${this.props.thinPaddingTop ? "wizard-body-thin-padding-top" : ""} ${this.props.className || ""}`}>
                <div className="wizard-form">
                    {this.props.children}
                </div>
            </div>
        )
    }
}
