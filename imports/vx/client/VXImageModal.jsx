import { Component } from "react"
import PropTypes from "prop-types"
import Cropper from "cropperjs"
import "cropperjs/dist/cropper.css"
import VXModal from "/imports/vx/client/VXModal"
import ModalHeaderImage from "/imports/vx/client/ModalHeaderImage"
import ModalBody from "/imports/vx/client/ModalBody"
import ModalFooterConfirm from "/imports/vx/client/ModalFooterConfirm"

export default class VXImageModal extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        component : PropTypes.object.isRequired,
        content : PropTypes.string,
        onCrop : PropTypes.func.isRequired
    }

    static defaultProps = {
        id : "vx-image-cropper-modal"
    }

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const image = document.getElementById("vx-image-cropper-image")
        const options = {}
        options.background = false
        options.aspectRatio = 1
        this.cropper = new Cropper(image, options)
    }

    render() {
        return (
            <VXModal id={this.props.id} width="600px">
                <ModalHeaderImage imageUrl={CX.LOGO_PATH}
                    heading={Util.i18n("common.label_crop_image")}
                    subheading={Util.i18n("common.label_crop_image_to_square")}/>
                <ModalBody>
                    <div className="image-cropper-container padding-top-20">
                        <img id="vx-image-cropper-image"
                            src={this.props.content}
                            className="image-cropper-image"/>
                    </div>
                </ModalBody>
                <ModalFooterConfirm onClickConfirm={this.handleClickConfirm.bind(this)}/>
            </VXModal>
        )
    }

    handleClickConfirm(callback) {
        const content = this.cropper.getCroppedCanvas().toDataURL()
        this.props.onCrop(content, callback)
    }
}
