import { Component } from "react"
import PropTypes from "prop-types"

export default class VXTinyEditorView extends Component {

    static defaultProps = {
        height: "100%"
    }

    static propTypes = {
        height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        value :  PropTypes.string
    }

    render() {
        return  (
            <div className="top-tiny-edit-view scroll-y scroll-momentum flexi-grow zero-height-hack"
                //style={{height: this.props.height}}
                dangerouslySetInnerHTML={{__html: this.props.value}}/>
        )
    }
}
