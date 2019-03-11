import { Component } from "react"
import PropTypes from "prop-types"
import Parser from "html-react-parser"

export default class EmptyEntityList extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        emptyMessage : PropTypes.string.isRequired,
        emptyListSize : PropTypes.oneOf(["small", "large"]).isRequired,
        dropClassName : PropTypes.string
    }

    render() {
        return (
            <div id={this.props.id}
                className={this.dropZoneClassNames()}>
                <span className={`empty-list-text-${this.props.emptyListSize}`}>
                    <span className="fa fa-lightbulb-o"></span>
                    {Parser(" " + this.props.emptyMessage)}
                </span>
            </div>
        )
    }

    dropZoneClassNames() {
        let myReturn = "empty-list flexi-grow flex-section-center"
        if (this.props.dropClassName) {
            myReturn += " " + this.props.dropClassName + " ui-sortable"
        }
        return myReturn
    }
}
