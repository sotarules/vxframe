import { Component } from "react"
import PropTypes from "prop-types"
import {get} from "lodash"
import VXTabFolder from "/imports/vx/client/VXTabFolder"
import VXTab from "/imports/vx/client/VXTab"
import VXTinyEditor from "/imports/vx/client/VXTinyEditor"
import VXTinyEditorView from "./VXTinyEditorView"

export default class NotesTabFolder extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        className : PropTypes.string,
        tabDbName : PropTypes.string.isRequired,
        notesDbName : PropTypes.string.isRequired,
        height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        editable : PropTypes.bool.isRequired,
        record : PropTypes.object.isRequired,
        getRowsPath : PropTypes.func.isRequired,
        historical : PropTypes.bool,
        onClickAddTab : PropTypes.func,
        onClickRemoveTab : PropTypes.func,
        onUpdateTabName : PropTypes.func,
        onUpdateTabNotes : PropTypes.func,
        onDropNotesTab : PropTypes.func
    }

    static defaultProps = {
        height : "100%",
        editable : false
    }

    constructor(props) {
        super(props)
        this.mustInitializeSortable = true
    }

    render() {
        return (
            <VXTabFolder id={this.props.id}
                activeTabId={this.firstTabId()}
                className={this.props.className}
                pills={false}
                editable={this.props.editable}
                draggable={this.props.editable}
                droppable={this.props.editable}
                dropClassName={"tab-drop-list"}
                record={this.props.record}
                selectText={true}
                tabDbName={this.props.tabDbName}
                onClickAddTab={this.handleClickAddTab.bind(this)}
                onClickRemoveTab={this.handleClickRemoveTab.bind(this)}
                onUpdateTabName={this.handleUpdateTabName.bind(this)}
                onUpdateTabNotes={this.handleUpdateTabNotes.bind(this)}
                onDrop={this.handleDropNotesTab.bind(this)}>
                {this.renderNotesTabs()}
            </VXTabFolder>
        )
    }

    renderNotesTabs() {
        const rowsPath = this.props.getRowsPath()
        const rows = get(this.props.record, rowsPath)
        if (!rows || rows.length === 0) {
            return (
                <VXTab id="tab-default"
                    key="tab-default"
                    itemId="default-item-id"
                    name={Util.i18n("common.tab_notes")}>
                    {this.renderEditor(`${this.props.id}-default-editor`, null)}
                </VXTab>
            )
        }
        return rows.map(row => {
            return (
                <VXTab id={row.id}
                    key={row.id}
                    itemId={row.id}
                    name={row.tabName}>
                    {this.renderEditor(`${this.props.id}-${row.id}-editor`, row.notes)}
                </VXTab>
            )
        })
    }

    renderEditor(id, value) {
        if (this.props.editable) {
            return (
                <VXTinyEditor id={id}
                    key={id}
                    value={value}
                    height={this.props.height}
                    disabled={!this.props.editable}
                    updateHandler={this.handleUpdateTabNotes.bind(this)}
                    dbName={this.props.notesDbName}/>
            )
        }
        return (
            <VXTinyEditorView value={value}
                height={this.props.height}/>
        )
    }

    firstTabId() {
        const rowsPath = this.props.getRowsPath()
        const rows = get(this.props.record, rowsPath)
        if (!rows || rows.length === 0) {
            return "tab-default"
        }
        return rows[0].id
    }

    handleClickAddTab(data) {
        if (this.props.onClickAddTab) {
            this.props.onClickAddTab(data)
        }
    }

    handleClickRemoveTab(data) {
        if (this.props.onClickAddTab) {
            this.props.onClickRemoveTab(data)
        }
    }

    handleUpdateTabName(component, value) {
        if (this.props.onUpdateTabName) {
            this.props.onUpdateTabName(component, value, this)
        }
    }

    handleUpdateTabNotes(component, value) {
        if (this.props.onUpdateTabNotes) {
            this.props.onUpdateTabNotes(component, value, this)
        }
    }

    handleDropNotesTab(dropInfo) {
        if (this.props.onDropNotesTab) {
            this.props.onDropNotesTab(dropInfo, this)
        }
    }
}
