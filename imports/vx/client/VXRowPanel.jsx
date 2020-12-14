import { Component } from "react"
import PropTypes from "prop-types"
import { get } from "lodash"
import VXTinyButton from "./VXTinyButton"
import EmptyEntityList from "./EmptyEntityList"
import VXForm from "./VXForm"

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
        passProps : PropTypes.object,
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
                <div className={`flexi-grow ${this.props.bodyClassName || ""}`}>
                    {this.anyRows() ? (
                        <VXForm id={`${this.props.id}-form`}
                            ref={form => {this.form = form}}
                            formElement="ul"
                            className={this.listClassName()}
                            dynamic={true}
                            updateHandler={this.handleUpdate.bind(this)}>
                            {this.renderRows()}
                        </VXForm>
                    ) : (
                        <EmptyEntityList id={`${this.props.id}-panel-body}`}
                            emptyListSize="large"
                            emptyMessage={this.props.emptyMessage} />
                    )}
                </div>
            </div>
        )
    }

    renderRows() {
        const rows = get(this.props.record, this.props.rowsPath)
        return rows.map(row => {
            const Component = this.props.component
            const id = get(row, this.props.rowId)
            return (
                <Component id={id}
                    key={id}
                    row={row}
                    {...this.props.passProps} />
            )
        })
    }

    anyRows() {
        const rows = get(this.props.record, this.props.rowsPath)
        return rows?.length > 0
    }

    listClassName() {
        return "list-group scroll-y scroll-momentum scroll-fix flexi-grow zero-height-hack dropzone-container-large " +
            (this.props.editable ? "row-panel-background-edit" : "row-panel-background-view")
    }

    handleClickAdd() {
        const row = {}
        row[this.props.rowId] = Util.getGuid()
        const modifier = {}
        modifier.$push = {}
        modifier.$push[this.props.rowsPath] = row
        OLog.debug(`VXRowPanel.jsx handleClickAdd recordId=${this.props.record._id} rowsPath=${this.props.rowsPath} ` +
            `modifier=${OLog.debugString(modifier)}`)
        this.props.collection.update(this.props.record._id, modifier, error => {
            if (error) {
                UX.notifyForError(error)
                return
            }
            OLog.debug(`VXRowPanel.jsx handleClickAdd recordId=${this.props.record._id} *success*`)
        })
    }

    handleClickRemove() {
        const rows = get(this.props.record, this.props.rowsPath)
        const row = _.findWhere(rows, { id: this.selectedRowId })
        if (!row) {
            return
        }
        const modifier = {}
        modifier.$pull = {}
        modifier.$pull[this.props.rowsPath] = row
        OLog.debug(`VXRowPanel.jsx handleClickRemove recordId=${this.props.record._id} rowsPath=${this.props.rowsPath} ` +
            `modifier=${OLog.debugString(modifier)}`)
        this.props.collection.update(this.props.record._id, modifier, error => {
            if (error) {
                UX.notifyForError(error)
                return
            }
            OLog.debug(`VXRowPanel.jsx handleClickRemove recordId=${this.props.record._id} *success*`)
        })
    }

    handleUpdate(component, value) {
        // The IDs of all components must start with the row ID
        const componentRowId = component.props.id.split("-")[0]
        if (!componentRowId) {
            return
        }
        const rows = get(this.props.record, this.props.rowsPath)
        const index = _.indexOf(_.pluck(rows, "id"), componentRowId)
        if (index < 0) {
            return
        }
        const modifier = {}
        modifier.$set = {}
        modifier.$set[`${this.props.rowsPath}.${index}.${component.props.dbName}`] = value
        OLog.debug(`VXRowPanel.jsx handleUpdate recordId=${this.props.record._id} rowsPath=${this.props.rowsPath} ` +
            `modifier=${OLog.debugString(modifier)}`)
        this.props.collection.update(this.props.record._id, modifier, error => {
            if (error) {
                UX.notifyForError(error)
                return
            }
            OLog.debug(`VXRowPanel.jsx handleUpdate recordId=${this.props.record._id} *success*`)
        })
    }
}
