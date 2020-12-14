import { Component } from "react"
import PropTypes from "prop-types"

export default class VXRow extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        editable : PropTypes.bool.isRequired,
        itemClassName : PropTypes.string
    }

    static defaultProps = {
        editable : false
    }

    render() {
        return (
            <li tabIndex={this.props.editable ? "0" : null} id={this.props.id}
                className={`list-group-item ${this.itemClassName()} entity-control-container flexi-fixed ${this.props.itemClassName || ""}`}
                data-row-id={this.props.id}
                onFocus={this.handleFocus.bind(this)}>
                {this.props.children}
            </li>
        )
    }

    itemClassName() {
        return this.props.editable ? "row-panel-list-group-item-edit" : "row-panel-list-group-item-view"
    }

    handleFocus() {
        const $panel = $("#" + this.props.id).closest(".panel")
        const component = UX.findComponentById($panel.attr("id"))
        component.setSelectedRowId(this.props.id)
    }
}
