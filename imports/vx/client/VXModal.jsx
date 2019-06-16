import { Component } from "react"
import PropTypes from "prop-types"

export default class VXModal extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        contentClass : PropTypes.string,
        backdrop : PropTypes.string
    }

    static defaultProps = {
        backdrop : "true"
    }

    render() {
        return (
            <div id={this.props.id}
                className="modal fade modal-centered"
                tabIndex="-1"
                role="dialog"
                data-backdrop={this.props.backdrop}
                aria-labelledby="modal-title"
                aria-hidden="true">
                <div className="modal-vertical-alignment-helper">
                    <div className="modal-dialog modal-vertical-align-center">
                        <div className={`modal-content ${this.props.contentClass || ""}`}>
                            {this.props.children}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    contentClasses() {
        return "modal-content " + this.props.contentClass
    }

    componentDidMount() {
        OLog.debug("VXModal.jsx componentDidMount displaying modal id=" + this.props.id)
        UX.modal("#" + this.props.id)
    }
}
