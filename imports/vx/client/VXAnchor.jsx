import React, { Component } from "react";
import PropTypes from "prop-types";

export default class VXAnchor extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired
    }

    static defaultProps = {
        id : "vx-anchor"
    }

    render() {
        return (
            <div id={this.props.id}/>
        )
    }
}
