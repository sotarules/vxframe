import { Component } from "react"
import PropTypes from "prop-types"

export default class EntityListHeader extends Component {

    static propTypes = {
        label : PropTypes.string.isRequired
    }

    render() {
        return (
            <div className="dropzone-header flex-section-fixed">
            {this.props.label}
            </div>
        )
    }
}
