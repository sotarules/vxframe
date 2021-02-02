import { Component } from "react"
import PropTypes from "prop-types"

export default class VXRow extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        editable : PropTypes.bool.isRequired,
        itemClassName : PropTypes.string,
        standardPadding : PropTypes.bool,
        controls : PropTypes.array
    }

    static defaultProps = {
        editable : false,
        standardPadding : true
    }

    render() {
        return (
            <div tabIndex={this.props.editable ? "0" : null} id={this.props.id}
                className={"list-group-item entity-control-container flexi-fixed " +
                    `${this.paddingClassName()} ${this.viewEditClassName()} ${this.props.itemClassName || ""}`}
                data-row-id={this.props.id}
                onFocus={this.handleFocus.bind(this)}>
                {this.props.children}
                {this.renderControls()}
            </div>
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
                    id={`${this.props.id}-${index}`}
                    key={`${this.props.id}-${index}`}
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
        return this.props.editable ? "row-panel-list-group-item-edit" : "row-panel-list-group-item-view"
    }

    handleFocus() {
        const $rowList = $("#" + this.props.id).closest(".row-list")
        const component = UX.findComponentById($rowList.attr("id"))
        component.setSelectedRowId(event, this.props.id, this)
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
