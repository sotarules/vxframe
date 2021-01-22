import { Component } from "react"
import PropTypes from "prop-types"
import { get } from "lodash"
import EmptyEntityList from "./EmptyEntityList"
import VXForm from "./VXForm"

export default class VXRowList extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        editable : PropTypes.bool.isRequired,
        borders : PropTypes.bool,
        bodyClassName : PropTypes.string,
        rows : PropTypes.array,
        rowId : PropTypes.string.isRequired,
        component : PropTypes.elementType.isRequired,
        emptyMessage : PropTypes.string,
        control : PropTypes.bool,
        controlClassName : PropTypes.string,
        controlTooltip : PropTypes.string,
        rowFilter : PropTypes.func,
        onClickControl : PropTypes.func,
        onSelectRow : PropTypes.func,
        onUpdateRow : PropTypes.func,
        rightPanel : PropTypes.bool,
        draggable : PropTypes.bool,
        droppable : PropTypes.bool,
        dragClassName : PropTypes.string,
        dropClassName : PropTypes.string,
        placeholderClassName : PropTypes.string,
        onDrop : PropTypes.func
    }

    static defaultProps = {
        editable : false,
        borders : true,
        rightPanel : true,
        placeholderClassName : "entity-drag-placeholder-conditional"
    }

    componentDidMount() {
        this.initDragAndDrop()
    }

    componentDidUpdate() {
        this.initDragAndDrop()
    }

    initDragAndDrop() {
        if (this.props.draggable) {
            UX.makeDraggable(`${this.props.id}-form`,
                this.props.dragClassName, this.props.dropClassName, this.props.placeholderClassName)
        }

        if (this.props.droppable) {
            UX.makeDroppable(`${this.props.id}-form`, this)
        }
    }

    // The empty <div> down below is there on purpose, it overcomes a bug in
    // jQuery sortable where the placeholder opens in the wrong position
    render() {
        const filteredRows = this.filteredRows()
        return (
            <div id={`${this.props.id}`}
                className="row-list flexi-grow">
                {filteredRows.length > 0 ? (
                    <VXForm id={`${this.props.id}-form`}
                        ref={form => {this.form = form}}
                        formElement="ul"
                        className={this.listClassName()}
                        dynamic={true}
                        updateHandler={this.handleUpdate.bind(this)}>
                        {this.renderRows(filteredRows)}
                        <div></div>
                    </VXForm>
                ) : (
                    <EmptyEntityList id={`${this.props.id}-form`}
                        className={this.emptyListClassName()}
                        dropClassName={this.props.dropClassName}
                        emptyListSize="large"
                        emptyMessage={this.props.emptyMessage} />
                )}
            </div>
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
            const id = get(row, this.props.rowId)
            return (
                <Component {...this.props}
                    id={id}
                    key={id}
                    row={row}/>
            )
        })
    }

    listClassName() {
        return "list-group scroll-y scroll-momentum scroll-fix flexi-grow zero-height-hack" +
            (this.props.rightPanel ? " dropzone-container-large" : "") +
            (this.props.draggable ? " " + this.props.dragClassName : "") +
            (this.props.droppable ? " " + this.props.dropClassName : "") +
            (this.props.bodyClassName ? " " + this.props.bodyClassName : "") +
            (this.props.editable ? " row-panel-background-edit" : " row-panel-background-view") +
            (this.props.borders ? " row-panel-borders" : "")
    }

    emptyListClassName() {
        return (this.props.bodyClassName ? this.props.bodyClassName : "") +
            (this.props.borders ? " row-panel-borders" : "")
    }

    setSelectedRowId(event, selectedRowId) {
        OLog.debug(`VXRowList.jsx setSelectedRowId selectedRowId=${selectedRowId}`)
        if (this.props.onSelectRow) {
            this.props.onSelectRow(event, selectedRowId, this)
        }
    }

    handleUpdate(component, value) {
        OLog.debug(`VXRowList.jsx handleUpdate componentId=${component.props.id} value=${value}`)
        if (this.props.onUpdateRow) {
            this.props.onUpdateRow(component, value)
        }
    }
}
