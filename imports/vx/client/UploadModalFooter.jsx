import { Component } from "react"
import PropTypes from "prop-types"
import ModalFooterConfirm from "./ModalFooterConfirm"
import ModalFooterSimple from "./ModalFooterSimple"

export default class UploadModalFooter extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        uploadType : PropTypes.string,
        file : PropTypes.object,
        uploadStatus : PropTypes.string,
        onClickConfirm : PropTypes.func.isRequired
    }

    static defaultProps = {
        id : "upload-modal-footer",
    }

    render() {
        return (
            <div id={this.props.id}>
                {this.showConfirm() ? (
                    <ModalFooterConfirm onClickConfirm={this.handleClickConfirm.bind(this)}/>
                ) : (
                    <ModalFooterSimple buttonText={Util.i18n("common.button_ok")}
                        buttonClassName="btn btn-default btn-custom btn-block"/>
                )}
            </div>
        )
    }

    showConfirm() {
        return this.props.uploadType && this.props.file &&
            (!this.props.uploadStatus || this.props.uploadStatus === "CLEARED")
    }

    handleClickConfirm(callback) {
        if (this.props.onClickConfirm) {
            this.props.onClickConfirm(callback)
        }
    }
}
