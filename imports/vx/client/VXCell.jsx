import { Component } from "react"
import PropTypes from "prop-types"
import VXSpan from "/imports/vx/client/VXSpan"

export default class VXCell extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        className : PropTypes.string,
        textClassName : PropTypes.string,
        required : PropTypes.bool,
        editable : PropTypes.bool,
        style : PropTypes.object,
        value : PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]),
        supplementalValues : PropTypes.array,
        rule : PropTypes.func,
        format : PropTypes.object,
        popoverPlacement : PropTypes.string,
        bindingType : PropTypes.string,
        extra : PropTypes.array,
        supplement : PropTypes.array,
        siblings : PropTypes.array,
        onUpdate : PropTypes.func,
        tandem : PropTypes.string,
        dbName : PropTypes.string,
        fetchHandler : PropTypes.func,
        updateHandler : PropTypes.func,
        modifyHandler : PropTypes.func,
        invalidHandler : PropTypes.func,
        missingReset : PropTypes.bool
    }

    render() {
        return (
            <td className={this.props.className}
                style={this.props.style}>
                <VXSpan {...this.props}
                    className={this.props.textClassName}>
                </VXSpan>
            </td>
        )
    }
}
