import { Component } from "react"
import PropTypes from "prop-types"
import { get } from "lodash"
import VXTinyButton from "./VXTinyButton"
import VXRowList from "./VXRowList"

export default class VXRowPanel extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        editable : PropTypes.bool.isRequired,
        title : PropTypes.string.isRequired,
        panelClassName : PropTypes.string,
        headingClassName : PropTypes.string,
        titleClassName : PropTypes.string,
        bodyClassName : PropTypes.string,
        collection : PropTypes.object.isRequired,
        record : PropTypes.object,
        rowsPath : PropTypes.string.isRequired,
        rowId : PropTypes.string.isRequired,
        component : PropTypes.elementType.isRequired,
        emptyMessage : PropTypes.string.isRequired,
        onClickAdd : PropTypes.func,
        onClickRemove : PropTypes.func
    }

    static defaultProps = {
        editable : false
    }

    constructor(props) {
        super(props)
        this.selectedRowId = null
    }

    setSelectedRowId(selectedRowId) {
        this.selectedRowId = selectedRowId
    }

    render() {
        return (
            <div id={this.props.id}
                className={`panel panel-default flexi-grow ${this.props.panelClassName || ""}`}>
                <div className={`panel-heading flexi-fixed flex-direction-row flex-justify-space-between ${this.props.headingClassName || ""}`}>
                    <div className={`row-panel-title ${this.props.titleClassName || ""}`}>
                        {this.props.title}
                    </div>
                    {this.props.editable &&
                        <div className="row-panel-button-container flexi-fixed flex-direction-row">
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
                    borders={false}
                    bodyClassName={this.props.bodyClassName}
                    rows={get(this.props.record, this.props.rowsPath)}
                    rowId="id"
                    component={this.props.component}
                    emptyMessage={this.props.emptyMessage}
                    onSelectRow={this.handleSelectRow.bind(this)}
                    onUpdateRow={this.handleUpdateRow.bind(this)}/>
            </div>
        )
    }

    handleSelectRow(event, selectedRowId) {
        this.setSelectedRowId(selectedRowId)
    }

    handleClickAdd() {
        VXApp.addRow(this.props.collection, this.props.record, this.props.rowsPath, this.props.rowId)
    }

    handleClickRemove() {
        VXApp.removeRow(this.props.collection, this.props.record, this.props.rowsPath, this.props.rowId, this.selectedRowId)
    }

    handleUpdateRow(component, value) {
        VXApp.updateRow(this.props.collection, this.props.record, this.props.rowsPath, component, value)
    }
}
