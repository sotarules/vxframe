import { Component } from "react"
import PropTypes from "prop-types"

export default class EntityList extends Component {

    static propTypes = {
        id : PropTypes.string,
        className : PropTypes.string,
        selectable : PropTypes.bool,
        borders : PropTypes.bool,
        chevrons : PropTypes.bool,
        controls : PropTypes.array,
        rightPanel : PropTypes.bool,
        rows : PropTypes.array,
        draggable : PropTypes.bool,
        droppable : PropTypes.bool,
        multi : PropTypes.bool,
        dragClone : PropTypes.bool,
        dropClone : PropTypes.bool,
        dropClassName : PropTypes.string,
        placeholderClassName : PropTypes.string,
        onDrop : PropTypes.func
    }

    static defaultProps = {
        placeholderClassName : "entity-drag-placeholder-conditional",
        borders : false
    }

    componentDidMount() {
        this.initSelectionAndDragAndDrop()
    }

    componentDidUpdate() {
        this.initSelectionAndDragAndDrop()
    }

    initSelectionAndDragAndDrop() {
        if ($(`#${this.props.id}`).hasClass("ui-sortable")) {
            return
        }
        $(`#${this.props.id}`).multiselectable({ multi: this.props.multi })
        if (this.props.draggable) {
            UX.makeDraggable(this.props.id, this.props.dropClassName, this.props.placeholderClassName, this)
        }
        if (this.props.droppable) {
            UX.makeDroppable(this.props.id, this.props.dropClassName, this.props.placeholderClassName, this)
        }
    }

    render() {
        return (
            <ul id={this.props.id}
                className={this.listClassName()}>
                {UX.augmentChildren(this.props.children,
                    (child) => child.type.displayName === "EntityItem",
                    {
                        chevrons : this.props.chevrons,
                        selectable : this.props.selectable,
                        draggable : this.props.draggable,
                        droppable : this.props.droppable,
                        multi : this.props.multi,
                        controls : this.props.controls
                    }
                )}
                <div></div>
            </ul>
        )
    }

    listClassName() {
        return "list-group scroll-y scroll-momentum scroll-fix flexi-grow zero-height-hack sortable" +
            (this.props.rightPanel ? " dropzone-container-large" : "") +
            (this.props.draggable ? " vx-draggable" : "") +
            (this.props.droppable ? " vx-droppable " + this.props.dropClassName : "") +
            (this.props.className ? " " + this.props.className : "")  +
            (this.props.borders ? " entity-list-borders" : "")
    }
}
