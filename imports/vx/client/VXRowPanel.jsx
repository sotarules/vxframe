import {Component} from "react"
import PropTypes from "prop-types"
import {get} from "lodash"
import VXTinyButton from "./VXTinyButton"
import VXRowList from "./VXRowList"
import ContextMenuCell from "./ContextMenuCell"

export default class VXRowPanel extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        editable : PropTypes.bool.isRequired,
        contentEditable : PropTypes.bool.isRequired,
        borders : PropTypes.bool.isRequired,
        title : PropTypes.string.isRequired,
        panelClassName : PropTypes.string,
        headingClassName : PropTypes.string,
        panelHeadingControl : PropTypes.bool,
        panelHeadingControlClass : PropTypes.string,
        titleClassName : PropTypes.string,
        bodyClassName : PropTypes.string,
        collection : PropTypes.object.isRequired,
        record : PropTypes.object,
        rowsPath : PropTypes.string.isRequired,
        rowId : PropTypes.string.isRequired,
        rows : PropTypes.array,
        component : PropTypes.elementType.isRequired,
        emptyMessage : PropTypes.string.isRequired,
        draggable : PropTypes.bool,
        droppable : PropTypes.bool,
        selectable : PropTypes.bool,
        multi : PropTypes.bool,
        dropClassName : PropTypes.string,
        placeholderClassName : PropTypes.string,
        rowFilter : PropTypes.func,
        contextMenuId : PropTypes.string,
        contextMenuComponent : PropTypes.elementType,
        contextMenuData : PropTypes.object,
        onDrop : PropTypes.func,
        onClickAdd : PropTypes.func,
        onClickRemove : PropTypes.func,
        onSelectRow : PropTypes.func,
        onUpdateRow : PropTypes.func,
        onClickPanelHeadingControl : PropTypes.func,
        onDoubleClickContextMenuCell : PropTypes.func
    }

    static defaultProps = {
        editable : false,
        contentEditable : false,
        selectable : false,
        borders : false
    }

    render() {
        return (
            <div id={this.props.id}
                className={`panel panel-default flexi-grow ${this.props.panelClassName || ""}`}>
                <div className={`panel-heading flexi-fixed flex-direction-row ${this.props.headingClassName || ""}`}>
                    <div className={`row-panel-title ${this.props.titleClassName || ""}`}>
                        {this.props.title}
                        <a className={`row-panel-header-control ${this.props.panelHeadingControlClass || "" }`}
                            onClick={this.handleClickPanelHeadingControl.bind(this)}/>
                    </div>
                    {this.props.editable &&
                        <div className="row-panel-button-container flex-direction-row">
                            <VXTinyButton id={`${this.props.id}-button-plus`}
                                className="row-panel-button-margin"
                                iconClassName="fa-plus"
                                onClick={this.handleClickAdd.bind(this)} />
                            <VXTinyButton id={`${this.props.id}-button-minus`}
                                className="row-panel-button-margin"
                                iconClassName="fa-minus"
                                onClick={this.handleClickRemove.bind(this)} />
                        </div>
                    }
                </div>
                {this.renderRowBody()}
            </div>
        )
    }

    renderRowBody() {
        return this.props.contextMenuId ? this.renderContextMenuRowList() : this.renderRowList()
    }

    renderContextMenuRowList() {
        return (
            <>
                <ContextMenuCell id={`${this.props.id}-context-menu-cell`}
                    key={`${this.props.id}-context-menu-cell`}
                    contextMenuId={this.props.contextMenuId}
                    data={this.props.contextMenuData}
                    className="flexi-grow"
                    onDoubleClick={this.handleDoubleClickContextMenuCell.bind(this)}>
                    {this.renderRowList()}
                </ContextMenuCell>
                {this.renderContextMenu()}
            </>
        )
    }

    renderContextMenu() {
        const Component = this.props.contextMenuComponent
        return (
            <Component {...this.props}
                id={this.props.contextMenuId}/>
        )
    }

    renderRowList() {
        return (
            <VXRowList {...this.props}
                id={`${this.props.id}-row-list`}
                editable={this.props.editable}
                contentEditable={this.props.contentEditable}
                borders={this.props.borders}
                bodyClassName={this.props.bodyClassName}
                rows={this.rows()}
                rowId="id"
                component={this.props.component}
                emptyMessage={this.props.emptyMessage}
                draggable={this.props.draggable}
                droppable={this.props.droppable}
                selectable={this.props.selectable}
                multi={this.props.multi}
                dropClassName={this.props.dropClassName}
                placeholderClassName={this.props.placeholderClassName}
                rowFilter={this.props.rowFilter}
                onDrop={this.props.onDrop}
                onSelectRow={this.handleSelectRow.bind(this)}
                onUpdateRow={this.handleUpdateRow.bind(this)}/>
        )
    }

    rows() {
        return this.props.rows ? this.props.rows : get(this.props.record, this.props.rowsPath)
    }

    handleClickPanelHeadingControl(event) {
        if (this.props.onClickPanelHeadingControl) {
            this.props.onClickPanelHeadingControl(event, this)
        }
    }

    handleClickAdd(event) {
        if (this.props.onClickAdd) {
            this.props.onClickAdd(event, this, this.props.collection, this.props.record,
                this.props.rowsPath, this.props.rowId)
            return
        }
        VXApp.addRow(this.props.collection, this.props.record, this.props.rowsPath,
            this.props.rowId)
        UX.scrollToBottom($(`#${this.props.id}-row-list`))
    }

    handleClickRemove(event) {
        let selectedRowIds = UX.selectedRowIds(`${this.props.id}-row-list`)
        if (selectedRowIds.length === 0) {
            const rows = this.rows()
            if (rows && rows.length > 0) {
                selectedRowIds = [ rows[rows.length - 1][this.props.rowId] ]
            }
        }
        if (selectedRowIds.length === 0) {
            return
        }
        if (this.props.onClickRemove) {
            this.props.onClickRemove(event, this, this.props.collection, this.props.record,
                this.props.rowsPath, this.props.rowId, selectedRowIds)
            return
        }
        VXApp.removeRow(this.props.collection, this.props.record,
            this.props.rowsPath, this.props.rowId, selectedRowIds)
    }

    handleSelectRow(component, value) {
        if (this.props.onSelectRow) {
            this.props.onSelectRow(component, value)
        }
    }

    handleUpdateRow(component, value) {
        if (this.props.onUpdateRow) {
            this.props.onUpdateRow(component, value, this.props.collection, this.props.record,
                this.props.rowsPath, this.props.rowId)
            return
        }
        VXApp.updateRow(this.props.collection, this.props.record,
            this.props.rowsPath, this.props.rowId, component, value)
    }

    handleDoubleClickContextMenuCell(event) {
        if (this.props.onDoubleClickContextMenuCell) {
            this.props.onDoubleClickContextMenuCell(event, this)
        }
    }
}

