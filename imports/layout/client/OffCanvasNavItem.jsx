import { Component } from "react"
import PropTypes from "prop-types"

export default class OffCanvasNavItem extends Component {

    static propTypes = {
        iconClass : PropTypes.string.isRequired,
        text : PropTypes.string.isRequired,
        path : PropTypes.string,
        onClick : PropTypes.func,
    }

    render() {
        return (
            <li>
                <a className="navmenu-delay"
                    data-navmenu-href={this.props.path}
                    onClick={this.onClick.bind(this)}>
                    <span className={`fa fa-fw ${this.props.iconClass}`}></span>
                    {" "}{this.props.text}
                </a>
            </li>
        )
    }

    onClick(event) {
        if (this.props.onClick) {
            this.props.onClick(event)
            return
        }
        UX.onClickMenuItem(event)
    }
}
