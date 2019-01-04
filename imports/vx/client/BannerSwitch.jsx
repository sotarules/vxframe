import React, { Component } from "react"
import PropTypes from "prop-types"
import VXSwitch from "/imports/vx/client/VXSwitch"

export default class BannerSwitch extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        onChange : PropTypes.func.isRequired,
        checked : PropTypes.bool,
        itemClassName : PropTypes.string,
        containerClassName : PropTypes.string,
        className : PropTypes.string
    }

    render() {
        return (
            <li className={`section-control ${this.props.itemClassName || ""}`}>
                <div className={`fade-first ${this.props.containerClassName || ""}`}>
                    <VXSwitch id={this.props.id}
                        size="normal"
                        className={this.props.className}
                        checked={this.props.checked}
                        onChange={this.props.onChange}/>
                </div>
            </li>
        )
    }
}
