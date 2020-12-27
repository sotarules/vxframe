import { Component } from "react"
import PropTypes from "prop-types"

export default class VXRow extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        editable : PropTypes.bool.isRequired,
        itemClassName : PropTypes.string,
        standardPadding : PropTypes.bool,
        control : PropTypes.bool,
        controlClassName : PropTypes.string,
        controlTooltip : PropTypes.string,
        onClickControl : PropTypes.func
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
                {this.props.control &&
                    <div>
                        <a className={`entity-control fa fa-xs ${this.props.controlClassName}`}
                            data-toggle="tooltip"
                            data-container="body"
                            title={this.props.controlTooltip}
                            onClick={this.handleClickControl.bind(this)}>
                        </a>
                        <div className="entity-control-hotzone"
                            onTouchStart={this.handleTouchStartControl.bind(this)}/>
                    </div>
                }
            </div>
        )
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

    handleClickControl(event) {
        if (UX.isTouchClick(event)) {
            OLog.debug("VXRow.jsx handleClickControl *touchclick* ignored")
            return
        }
        this.handleControl(event)
    }

    handleTouchStartControl(event) {
        UX.armTouchClick(event)
        this.handleControl(event)
    }

    handleControl(event) {
        if (this.props.onClickControl) {
            this.props.onClickControl(event, this)
        }
    }
}
