import React, { Component } from "react";
import PropTypes from "prop-types";

export default class FileButton extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        className: PropTypes.string.isRequired,
        onChange : PropTypes.func.isRequired
    }

    render() {
        return (
            <div id={this.props.id}
                type="button"
                className={this.props.className}>
                {this.props.children}
                <input type="file"
                    value=""
                    onChange={this.props.onChange}/>
            </div>
        )
    }
}
