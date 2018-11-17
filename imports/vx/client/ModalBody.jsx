import { Component } from "react";
import PropTypes from "prop-types";

export default class ModalBody extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        className : PropTypes.string,
        thinPaddingTop : PropTypes.bool
    }

    static defaultProps = {
        id : "modal-body"
    }

    render() {
        return (
            <div id={this.props.id} className={`modal-body ${this.props.thinPaddingTop ? "modal-body-thin-padding-top" : ""} ${this.props.className || ""}`}>
                <div className="modal-form">
                    {this.props.children}
                </div>
            </div>
        )
    }
}
