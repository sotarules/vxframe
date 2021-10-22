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
        emptyListMargins : PropTypes.bool.isRequired,
        emptyListWhiteBackground : PropTypes.bool.isRequired,
        scrollable : PropTypes.bool,
        droppable : PropTypes.bool,
        dropClone : PropTypes.bool,
        dropClassName : PropTypes.string,
        onDrop : PropTypes.func
    }

    static defaultProps = {
        scrollable : true,
        emptyListMargins : true,
        emptyListWhiteBackground : true,
        placeholderClassName : "entity-drag-placeholder-conditional",
    }

    componentDidMount() {
        UX.makeDraggableDroppable(this.props.id, this.props.dropClassName, this.props.placeholderClassName, this,
            false, this.props.droppable)
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
        return `empty-list list-group  ${this.marginsClassName()} ${this.backgroundClassName()} ` +
            `flexi-grow flex-section-center ${this.props.className || ""}` +
            (this.props.scrollable ? this.scrollClasses() : "" ) +
            (this.props.droppable ? " vx-droppable " + this.props.dropClassName : "")
    }

    scrollClasses() {
        return " scroll-y scroll-momentum " + (this.props.zeroHeightHack ? " zero-height-hack" : "")
    }

    marginsClassName() {
        return !this.props.emptyListMargins ? "empty-list-no-margins" : ""
    }

    backgroundClassName() {
        return this.props.emptyListWhiteBackground ? "empty-list-white-background" : ""
    }
}
