import {Component} from "react"
import PropTypes from "prop-types"
import {get} from "lodash"
import VXTinyButton from "./VXTinyButton"
import VXRowList from "./VXRowList"

export default class VXRowPanel extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        editable : PropTypes.bool.isRequired,
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
        component : PropTypes.elementType.isRequired,
        emptyMessage : PropTypes.string.isRequired,
        draggable : PropTypes.bool,
        droppable : PropTypes.bool,
        selectable : PropTypes.bool,
        multi : PropTypes.bool,
        dropClassName : PropTypes.string,
        placeholderClassName : PropTypes.string,
        rowFilter : PropTypes.func,
        onDrop : PropTypes.func,
        onClickAdd : PropTypes.func,
        onClickRemove : PropTypes.func,
        onUpdateRow : PropTypes.func,
        onClickPanelHeadingControl : PropTypes.func
    }

    static defaultProps = {
        editable : false,
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
                <VXRowList {...this.props}
                    id={`${this.props.id}-row-list`}
                    editable={this.props.editable}
                    borders={this.props.borders}
                    bodyClassName={this.props.bodyClassName}
                    rows={get(this.props.record, this.props.rowsPath)}
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
                    onUpdateRow={this.handleUpdateRow.bind(this)}/>
            </div>
        )
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
    }

    handleClickRemove(event) {
        if (this.props.onClickRemove) {
            this.props.onClickRemove(event, this, this.props.collection, this.props.record,
                this.props.rowsPath, this.props.rowId, UX.selectedRowIds(`${this.props.id}-row-list`))
            return
        }
        VXApp.removeRow(this.props.collection, this.props.record,
            this.props.rowsPath, this.props.rowId, UX.selectedRowIds(`${this.props.id}-row-list`))
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
}
