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
        dropClassName : PropTypes.string,
        placeholderClassName : PropTypes.string,
        placeholderWidthMax : PropTypes.number,
        placeholderHeighthMax : PropTypes.number,
        onDrop : PropTypes.func
    }

    static defaultProps = {
        placeholderClassName : "entity-drag-placeholder-conditional",
        borders : false
    }

    constructor(props) {
        super(props)
        this.mustInitializeSortable = true
    }

    componentDidMount() {
        this.initSelectionAndDragAndDrop()
    }

    componentDidUpdate() {
        this.initSelectionAndDragAndDrop()
    }

    initSelectionAndDragAndDrop() {
        if (this.mustInitializeSortable) {
            $(`#${this.props.id}`).multiselectable({ multi: this.props.multi })
            UX.makeDraggableDroppable(this)
            this.mustInitializeSortable = false
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
        return "vx-list list-group scroll-y scroll-momentum flexi-grow zero-height-hack sortable" +
            (this.props.rightPanel ? " dropzone-container-large" : "") +
            (this.props.draggable ? " vx-draggable" : "") +
            (this.props.droppable ? " vx-droppable " + this.props.dropClassName : "") +
            (this.props.className ? " " + this.props.className : "")  +
            (this.props.borders ? " entity-list-borders" : "")
    }
}
