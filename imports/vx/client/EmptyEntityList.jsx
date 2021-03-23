import { Component } from "react"
import PropTypes from "prop-types"
import Parser from "html-react-parser"
import VXForm from "./VXForm"

export default class EmptyEntityList extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        className : PropTypes.string,
        emptyMessage : PropTypes.string,
        emptyListSize : PropTypes.oneOf(["small", "large"]).isRequired,
        droppable : PropTypes.bool,
        dropClone : PropTypes.bool,
        dropClassName : PropTypes.string,
        onDrop : PropTypes.func
    }

    static defaultProps = {
        placeholderClassName : "entity-drag-placeholder-conditional",
    }

    componentDidMount() {
        if (this.props.droppable) {
            UX.makeDroppable(this.props.id, this.props.dropClassName, this.props.placeholderClassName, this)
        }
    }

    render() {
        return (
            <VXForm id={this.props.id}
                className={this.dropZoneClassNames()}>
                {this.props.emptyMessage &&
                    <span className={`empty-list-text-${this.props.emptyListSize}`}>
                        <span className="fa fa-lightbulb-o"></span>
                        {Parser(` ${this.props.emptyMessage}`)}
                    </span>
                }
            </VXForm>
        )
    }

    dropZoneClassNames() {
        return `empty-list list-group flexi-grow flex-section-center ${this.props.className || ""}` +
            (this.props.droppable ? " vx-droppable " + this.props.dropClassName : "")
    }
}
