import { Component } from "react"
import PropTypes from "prop-types"
import {get} from "lodash"
import VXTabFolder from "/imports/vx/client/VXTabFolder"
import VXTab from "/imports/vx/client/VXTab"
import VXTextEditor from "/imports/vx/client/VXTextEditor"

export default class NotesTabFolder extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        className : PropTypes.string,
        tabDbName : PropTypes.string.isRequired,
        notesDbName : PropTypes.string.isRequired,
        editable : PropTypes.bool.isRequired,
        record : PropTypes.object.isRequired,
        getRowsPath : PropTypes.func.isRequired,
        historical : PropTypes.bool,
        onClickAddTab : PropTypes.func,
        onClickRemoveTab : PropTypes.func,
        onUpdateTabName : PropTypes.func,
        onUpdateTabNotes : PropTypes.func
    }

    static defaultProps = {
        editable : false
    }

    render() {
        return (
            <VXTabFolder id={this.props.id}
                activeTabId={`${this.props.id}-tab-0`}
                className={this.props.className}
                pills={false}
                editable={this.props.editable}
                record={this.props.record}
                selectText={true}
                tabDbName={this.props.tabDbName}
                onClickAddTab={this.handleClickAddTab.bind(this)}
                onClickRemoveTab={this.handleClickRemoveTab.bind(this)}
                onUpdateTabName={this.handleUpdateTabName.bind(this)}
                onUpdateTabNotes={this.handleUpdateTabNotes.bind(this)}>
                {this.renderNotesTabs()}
            </VXTabFolder>
        )
    }

    renderNotesTabs() {
        const rowsPath = this.props.getRowsPath()
        const rows = get(this.props.record, rowsPath)
        if (!rows || rows.length === 0) {
            return (
                <VXTab id={`${this.props.id}-tab-0`}
                    key={`${this.props.id}-tab-0`}
                    itemId="default-item-id"
                    name={Util.i18n("common.tab_notes")}>
                    <VXTextEditor id={`${this.props.id}-tab-editor-0`}
                        value={null}
                        height={120}
                        disabled={!this.props.editable}
                        updateHandler={this.handleUpdateTabNotes.bind(this)}
                        dbName={this.props.notesDbName}/>
                </VXTab>
            )
        }
        return rows.map((row, index) => {
            return (
                <VXTab id={`${this.props.id}-tab-${index}`}
                    key={`${this.props.id}-tab-${index}`}
                    itemId={row.id}
                    name={row.tabName}>
                    <VXTextEditor id={`${this.props.id}-tab-editor-${index}`}
                        tabIndex={index}
                        value={row.notes}
                        height={120}
                        disabled={!this.props.editable}
                        updateHandler={this.handleUpdateTabNotes.bind(this)}
                        dbName={this.props.notesDbName}/>
                </VXTab>
            )
        })
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
}
