import { Component } from "react"
import PropTypes from "prop-types"

export default class VXModal extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        backdrop : PropTypes.string,
        width : PropTypes.string,
        scrollBody : PropTypes.bool
    }

    static defaultProps = {
        backdrop : "true",
        width : "600px",
        scrollBody : false
    }

    render() {
        return (
            <div id={this.props.id}
                className={this.className()}
                tabIndex="-1"
                role="dialog"
                data-backdrop={this.props.backdrop}
                aria-labelledby="modal-title"
                aria-hidden="true">
                <div className="modal-dialog"
                    style={{ width: this.props.width }}>
                    <div className="modal-content"
                        style={{ width: this.props.width }}>
                        {this.props.children}
                    </div>
                </div>
            </div>
        )
    }

    className() {
        return `modal fade modal-centered not-selectable ${this.props.scrollBody ? "modal-scroll-body" : ""}`
    }

    componentDidMount() {
        OLog.debug(`VXModal.jsx componentDidMount displaying modal id=${this.props.id}`)
        UX.modal("#" + this.props.id)
    }
}
