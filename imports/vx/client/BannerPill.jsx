import React, { Component } from "react"
import PropTypes from "prop-types"

export default class BannerPill extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        className : PropTypes.string,
        text : PropTypes.string.isRequired,
        isActive: PropTypes.bool.isRequired,
        onClick : PropTypes.func.isRequired
    }

    render() {
        return (
            <li className={`section-control ${this.props.isActive ? "active" : ""}`}>
                <a id={this.props.id}
                    className={this.props.className}
                    onClick={this.props.onClick}>
                {this.props.text}
                </a>
            </li>
        )
    }
}
