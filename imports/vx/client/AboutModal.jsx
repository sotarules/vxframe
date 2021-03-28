import { Component } from "react"
import PropTypes from "prop-types"
import VXModal from "/imports/vx/client/VXModal"
import ModalBody from "/imports/vx/client/ModalBody"
import ModalFooterSimple from "/imports/vx/client/ModalFooterSimple"

export default class AboutModal extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired
    }

    static defaultProps = {
        id : "layout-about-modal"
    }

    render() {
        return (
            <VXModal id={this.props.id} width="320px">
                <ModalBody>
                    <div className="row">
                        <div className="col-xs-12 margin-top-10">
                            <img src={CX.LOGO_PATH} className="img-responsive pull-center"/>
                            <div className="logo-title">
                                {Util.i18n("common.label_logo_title")}
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xs-4">
                            <div className="top-fieldbox-header">
                                {Util.i18n("layout.label_system_version")}
                            </div>
                            <div className="top-fieldbox">
                                <span className="top-fieldbox-text">{this.systemVersion()}</span>
                            </div>
                        </div>
                        <div className="col-xs-8">
                            <div className="top-fieldbox-header">
                                {Util.i18n("layout.label_system_build_date")}
                            </div>
                            <div className="top-fieldbox">
                                <span className="top-fieldbox-text">
                                    {this.systemBuildDate()}</span>
                            </div>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooterSimple buttonText={Util.i18n("common.button_ok")}
                    buttonClassName="btn btn-default btn-custom btn-block"/>
            </VXModal>
        )
    }

    systemVersion() {
        return Meteor.appVersion.version
    }

    systemBuildDate() {
        return moment(Meteor.appVersion.buildDate).zone(UX.timezone()).format("D MMM YYYY h:mm A")
    }
}
