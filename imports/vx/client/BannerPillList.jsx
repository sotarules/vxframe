import React, { Component } from "react"
import PropTypes from "prop-types"

export default class BannerPillList extends Component {

    static propTypes = {
        className : PropTypes.string
    }

    render() {
        return (
            <ul className={`nav nav-pills ${this.props.className || ""}`}>
                {this.props.children}
            </ul>
        )
    }
}
