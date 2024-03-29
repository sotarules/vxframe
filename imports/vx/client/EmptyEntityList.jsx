import { Component } from "react"
import PropTypes from "prop-types"
import Parser from "html-react-parser"
import VXForm from "./VXForm"

export default class EmptyEntityList extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        className : PropTypes.string,
        emptyMessage : PropTypes.string,
        emptyListMargins : PropTypes.bool.isRequired,
        emptyListWhiteBackground : PropTypes.bool.isRequired,
        scrollable : PropTypes.bool,
        zeroHeightHack : PropTypes.bool,
        draggable : PropTypes.bool,
        droppable : PropTypes.bool,
        dropClassName : PropTypes.string,
        placeholderClassName : PropTypes.string,
        placeholderWidthMax : PropTypes.number,
        placeholderHeighthMax : PropTypes.number,
        onDrop : PropTypes.func
    }

    static defaultProps = {
        scrollable : true,
        emptyListMargins : false,
        emptyListWhiteBackground : true,
        placeholderClassName : "entity-drag-placeholder-conditional",
        zeroHeightHack : true
    }

    componentDidMount() {
        UX.makeDraggableDroppable(this)
    }

    render() {
        return (
            <VXForm id={this.props.id}
                className={this.dropZoneClassNames()}>
                {this.props.emptyMessage &&
                    <span className="empty-list-text-large">
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
