import { Component } from "react"
import PropTypes from "prop-types"

export default class VXModal extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        contentClass : PropTypes.string,
    }

    render() {
        // DL--data-backdrop="false" to remove backdrop
        return (
            <div className="modal fade modal-centered" id={this.props.id}
                tabIndex="-1" role="dialog" aria-labelledby="modal-title"
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
