import { Component } from "react";
import PropTypes from "prop-types";

export default class ProgressBarClear extends Component {

    static propTypes = {
        onClick : PropTypes.func.isRequired
    }

    render() {

        return (
            <div className="progress-clear" onClick={this.props.onClick}>
                <span className="fa fa-times"></span>
            </div>
        );
    }
}
