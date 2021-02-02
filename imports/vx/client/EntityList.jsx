import { Component } from "react"
import PropTypes from "prop-types"

export default class EntityList extends Component {

    static propTypes = {
        id : PropTypes.string,
        className : PropTypes.string,
        selectable : PropTypes.bool,
        chevrons : PropTypes.bool,
        controls : PropTypes.array,
        rightPanel : PropTypes.bool,
        draggable : PropTypes.bool,
        droppable : PropTypes.bool,
        dragClassName : PropTypes.string,
        dropClassName : PropTypes.string,
        placeholderClassName : PropTypes.string,
        onDrop : PropTypes.func
    }

    static defaultProps = {
        placeholderClassName : "entity-drag-placeholder-conditional"
    }

    componentDidMount() {
        if (this.props.draggable) {
            UX.makeDraggable(this.props.id, this.props.dragClassName,
                this.props.dropClassName, this.props.placeholderClassName)
        }

        if (this.props.droppable) {
            UX.makeDroppable(this.props.id, this)
        }
    }

    render() {
        return (
            <ul id={this.props.id} className={this.listClassName()}>
                {UX.augmentChildren(this.props.children,
                    (child) => child.type.displayName === "EntityItem",
                    {
                        chevrons : this.props.chevrons,
                        selectable : this.props.selectable,
                        controls : this.props.controls
                    }
                )}
            </ul>
        )
    }

    listClassName() {
        return "list-group scroll-y scroll-momentum scroll-fix flexi-grow zero-height-hack" +
            (this.props.rightPanel ? " dropzone-container-large" : "") +
            (this.props.draggable ? " " + this.props.dragClassName : "") +
            (this.props.droppable ? " " + this.props.dropClassName : "") +
            (this.props.className ? " " + this.props.className : "")
    }
}
