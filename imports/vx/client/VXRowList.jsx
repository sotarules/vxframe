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
        whiteRows : PropTypes.bool,
        bodyClassName : PropTypes.string,
        rows : PropTypes.array,
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
        zeroHeightHack : PropTypes.bool,
        dropClassName : PropTypes.string,
        placeholderClassName : PropTypes.string
    }

    static defaultProps = {
        editable : false,
        contentEditable : false,
        borders : true,
        whiteRows : false,
        rightPanel : true,
        zeroHeightHack : true,
        placeholderClassName : "entity-drag-placeholder-conditional"
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
        $(`#${this.props.id}`).multiselectable({ multi: this.props.multi, items: ".list-group-item" })
        if (this.props.draggable) {
            UX.makeDraggable(this.props.id, this.props.dropClassName, this.props.placeholderClassName, this)
        }
        if (this.props.droppable) {
            UX.makeDroppable(this.props.id,  this.props.dropClassName, this.props.placeholderClassName, this)
        }
    }

    // The empty <div> down below is there on purpose, it overcomes a bug in
    // jQuery sortable where the placeholder opens in the wrong position
    render() {
        const filteredRows = this.filteredRows()
        if (filteredRows.length > 0) {
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
        return (
            <EmptyEntityList id={this.props.id}
                className={this.emptyListClassName()}
                droppable={this.props.droppable}
                dropClassName={this.props.dropClassName}
                onDrop={this.props.onDrop}
                emptyListSize="large"
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
        return filteredRows.map(row => {
            const Component = this.props.component
            const id = `${this.props.id}-${get(row, this.props.rowId)}`
            return (
                <Component {...this.props}
                    id={id}
                    key={id}
                    row={row}/>
            )
        })
    }

    listClassName() {
        return "list-group scroll-y scroll-momentum scroll-fix flexi-grow " +
            (this.props.zeroHeightHack ? " zero-height-hack" : "") +
            (this.props.rightPanel ? " dropzone-container-large" : "") +
            (this.props.draggable ? " vx-draggable" : "") +
            (this.props.droppable ? " vx-droppable " + this.props.dropClassName : "") +
            (this.props.bodyClassName ? " " + this.props.bodyClassName : "") +
            (this.props.editable || this.props.whiteRows ? " row-panel-background-edit" : " row-panel-background-view") +
            (this.props.borders ? " row-panel-borders" : "")
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
