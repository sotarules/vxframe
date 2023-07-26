import { Component } from "react"
import PropTypes from "prop-types"

export default class VXRow extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        itemId : PropTypes.string,
        dbId : PropTypes.string,
        selectable : PropTypes.bool,
        editable : PropTypes.bool,
        whiteRows : PropTypes.bool,
        itemClassName : PropTypes.string,
        standardPadding : PropTypes.bool,
        controls : PropTypes.array,
        onSelectRow : PropTypes.func,
        onClick : PropTypes.func,
        onDoubleClick : PropTypes.func
    }

    static defaultProps = {
        whiteRows : false,
        standardPadding : true
    }

    render() {
        return (
            <div tabIndex={this.tabIndex()}
                id={this.props.id}
                key={this.props.itemId}
                data-item-id={this.props.itemId}
                data-db-id={this.props.dbId}
                className={"vx-list-item list-group-item flexi-fixed entity-control-container " +
                    `${this.paddingClassName()} ${this.viewEditClassName()} ${this.props.itemClassName || ""}`}
                onFocus={this.handleFocus.bind(this)}
                onClick={this.handleClick.bind(this)}
                onDoubleClick={this.handleDoubleClick.bind(this)}>
                {this.props.children}
                {this.renderHandle()}
                {this.renderControls()}
            </div>
        )
    }

    tabIndex() {
        return (this.props.selectable || this.props.editable) ? "0" : null
    }

    renderHandle() {
        if (!this.props.draggable) {
            return null
        }
        return (
            <a className="row-handle entity-handle fa fa-bars fa-xs"/>
        )
    }

    renderControls() {
        if (!this.props.controls) {
            return null
        }
        return (
            <div className="entity-control-set">
                {this.renderControlRow()}
            </div>
        )
    }

    renderControlRow() {
        return this.props.controls.map((control, index) => {
            return (
                <a className={`entity-control-element fa fa-xs ${control.className}`}
                    id={`${this.props.id}-control-${index}`}
                    key={`${this.props.id}-control-${index}`}
                    data-toggle="tooltip"
                    data-container="body"
                    title={control.tooltip}
                    onClick={this.handleClickControlSet.bind(this)}>
                </a>
            )
        })
    }

    paddingClassName() {
        return this.props.standardPadding ? "row-panel-list-group-item-standard-padding" : ""
    }

    viewEditClassName() {
        return this.props.editable || this.props.whiteRows ?
            "row-panel-list-group-item-edit" : "row-panel-list-group-item-view"
    }

    handleFocus(event) {
        if (this.props.onSelectRow) {
            this.props.onSelectRow(event, this)
        }
    }

    handleClick(event) {
        if (this.props.onClick) {
            this.props.onClick(event, this)
        }
    }

    handleDoubleClick(event) {
        if (this.props.onDoubleClick) {
            this.props.onDoubleClick(event, this)
        }
    }

    handleClickControlSet(event) {
        const id = $(event.target).attr("id")
        const index = Util.lastToken(id, "-")
        const control = this.props.controls[index]
        if (control.onClick) {
            control.onClick(event, this, index)
        }
    }
}
