import {Component} from "react"
import PropTypes from "prop-types"
import {get} from "lodash"
import EmptyEntityList from "./EmptyEntityList"
import VXForm from "./VXForm"

export default class VXRowList extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        editable : PropTypes.bool.isRequired,
        contentEditable : PropTypes.bool.isRequired,
        borders : PropTypes.bool,
        emptyListMargins : PropTypes.bool,
        emptyListWhiteBackground : PropTypes.bool,
        whiteRows : PropTypes.bool,
        bodyClassName : PropTypes.string,
        rows : PropTypes.array,
        parent : PropTypes.object,
        rowId : PropTypes.string.isRequired,
        component : PropTypes.elementType.isRequired,
        emptyMessage : PropTypes.string,
        controls : PropTypes.array,
        rowFilter : PropTypes.func,
        onSelectRow : PropTypes.func,
        onUpdateRow : PropTypes.func,
        onDrop : PropTypes.func,
        rightPanel : PropTypes.bool,
        selectable : PropTypes.bool,
        draggable : PropTypes.bool,
        droppable : PropTypes.bool,
        multi : PropTypes.bool,
        dragClone : PropTypes.bool,
        dropClone : PropTypes.bool,
        scrollable : PropTypes.bool,
        zeroHeightHack : PropTypes.bool,
        dropClassName : PropTypes.string,
        placeholderClassName : PropTypes.string
    }

    static defaultProps = {
        editable : false,
        contentEditable : false,
        borders : true,
        emptyListMargins: false,
        whiteRows : false,
        rightPanel : true,
        scrollable : true,
        zeroHeightHack : true,
        placeholderClassName : "entity-drag-placeholder-conditional"
    }

    constructor(props) {
        super(props)
        this.mode = null
        this.mustInitializeSortable = false
    }

    componentDidMount() {
        this.initSelectionAndDragAndDrop()
    }

    componentDidUpdate() {
        this.initSelectionAndDragAndDrop()
    }

    initSelectionAndDragAndDrop() {
        if (this.mustInitializeSortable) {
            $(`#${this.props.id}`).multiselectable({ multi: this.props.multi, items: ".vx-list-item" })
            UX.makeDraggableDroppable(this.props.id, this.props.dropClassName, this.props.placeholderClassName, this,
                this.props.draggable, this.props.droppable)
            this.mustInitializeSortable = false
        }
    }

    // The empty <div> down below is there on purpose, it overcomes a bug in
    // jQuery sortable where the placeholder opens in the wrong position
    render() {
        const filteredRows = this.filteredRows()
        if (filteredRows.length > 0) {
            if (this.mode !== "NORMAL") {
                this.mustInitializeSortable = true
                this.mode = "NORMAL"
            }
            return (
                <VXForm id={this.props.id}
                    ref={form => {this.form = form}}
                    formElement="ul"
                    className={this.listClassName()}
                    dynamic={true}
                    updateHandler={this.handleUpdate.bind(this)}>
                    {this.renderRows(filteredRows)}
                    <div></div>
                </VXForm>
            )
        }
        if (this.mode !== "EMPTY") {
            this.mustInitializeSortable = false
            this.mode = "EMPTY"
        }
        return (
            <EmptyEntityList id={this.props.id}
                className={this.emptyListClassName()}
                droppable={this.props.droppable}
                scrollable={this.props.scrollable}
                dropClassName={this.props.dropClassName}
                onDrop={this.props.onDrop}
                emptyListMargins={this.props.emptyListMargins}
                emptyListWhiteBackground={this.props.emptyListWhiteBackground}
                emptyMessage={this.props.emptyMessage}/>
        )
    }

    filteredRows() {
        if (this.props.rowFilter) {
            return _.filter(this.props.rows, this.props.rowFilter)
        }
        return this.props.rows || []
    }

    renderRows(filteredRows) {
        return filteredRows.map((row, rowIndex) => {
            const Component = this.props.component
            const id = `${this.props.id}-${get(row, this.props.rowId)}`
            row.parent = this.props.parent
            row.rowIndex = rowIndex
            return (
                <Component {...this.props}
                    id={id}
                    key={id}
                    row={row}/>
            )
        })
    }

    listClassName() {
        return "vx-list list-group flexi-grow " +
            (this.props.scrollable ? this.scrollClasses() : "" ) +
            (this.props.rightPanel ? " dropzone-container-large" : "") +
            (this.props.draggable ? " vx-draggable" : "") +
            (this.props.droppable ? " vx-droppable " + this.props.dropClassName : "") +
            (this.props.bodyClassName ? " " + this.props.bodyClassName : "") +
            (this.props.editable || this.props.whiteRows ? " row-panel-background-edit" : " row-panel-background-view") +
            (this.props.borders ? " row-panel-borders" : "")
    }

    scrollClasses() {
        return " scroll-y scroll-momentum " + (this.props.zeroHeightHack ? " zero-height-hack" : "")
    }

    emptyListClassName() {
        return (this.props.bodyClassName ? this.props.bodyClassName : "") +
            (this.props.borders ? " row-panel-borders" : "")
    }

    handleUpdate(component, value) {
        OLog.debug(`VXRowList.jsx handleUpdate componentId=${component.props.id} value=${value}`)
        if (this.props.onUpdateRow) {
            this.props.onUpdateRow(component, value)
        }
    }
}
