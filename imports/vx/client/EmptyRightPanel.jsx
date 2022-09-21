import { Component } from "react"
import PropTypes from "prop-types"
import Parser from "html-react-parser"

export default class EmptyRightPanel extends Component {

    static propTypes = {
        emptyMessage : PropTypes.string.isRequired,
        className : PropTypes.string
    }

    render() {
        return (
            <div className={`empty-rhs flex-section-center flexi-grow ${this.props.className || ""}`}>
                <span className="empty-list-text-large">
                    <span className="fa fa-lightbulb-o"></span>
                    {Parser(" " + this.props.emptyMessage)}
                </span>
            </div>
        )
    }
}
