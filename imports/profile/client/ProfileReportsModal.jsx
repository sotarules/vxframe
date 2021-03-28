import { Component } from "react"
import PropTypes from "prop-types"
import VXModal from "/imports/vx/client/VXModal"
import ModalHeaderImage from "/imports/vx/client/ModalHeaderImage"
import ModalBody from "/imports/vx/client/ModalBody"
import ModalFooterConfirm from "/imports/vx/client/ModalFooterConfirm"
import VXForm from "/imports/vx/client/VXForm"
import VXDate from "/imports/vx/client/VXDate"
import VXSelect from "/imports/vx/client/VXSelect"

export default class ProfileReportsModal extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        user : PropTypes.object.isRequired,
        reportType : PropTypes.string.isRequired
    }

    static defaultProps = {
        id : "report-parameters-modal"
    }

    render() {
        return (
            <VXModal id={this.props.id} width="350px">
                <ModalHeaderImage imageUrl={CX.LOGO_PATH}
                    heading={this.reportDescription()}
                    subheading={Util.i18n("common.label_report_parameters")}/>
                <ModalBody>
                    <VXForm id="profile-reports-modal-form"
                        elementType="div"
                        receiveProps={false}
                        ref={(form) => { this.form = form }}>
                        {this.renderParameters()}
                    </VXForm>
                </ModalBody>
                <ModalFooterConfirm onClickConfirm={this.handleClickConfirm.bind(this)}/>
            </VXModal>
        )
    }

    renderParameters() {
        let reportParameterDefinitions = Util.reportParameterDefinitions(this.props.reportType)
        let reportParameterDefaults = Util.reportParameterDefaults(this.props.reportType, this.props.user)
        return reportParameterDefinitions.map(parameterDefinition => {
            return (
                <div key={parameterDefinition.fieldName} className="row">
                    <div className="col-sm-12">
                        {parameterDefinition.type === "DATE" &&
                            <VXDate id={parameterDefinition.fieldName}
                                label={parameterDefinition.fieldNameLocalized}
                                required={true}
                                format="M/D/YYYY"
                                timezone={Util.reportTimezone(this.props.reportType, this.props.user)}
                                value={reportParameterDefaults[parameterDefinition.fieldName]}>
                            </VXDate>
                        }
                        {parameterDefinition.type === "SELECT" &&
                            <VXSelect id={parameterDefinition.fieldName}
                                label={parameterDefinition.fieldNameLocalized}
                                required={true}
                                codeArray={UX.makeCodeArray(parameterDefinition.code)}
                                value={reportParameterDefaults[parameterDefinition.fieldName]}/>
                        }
                    </div>
                </div>
            )
        })
    }

    reportDescription() {
        return Util.i18n("codes.reportType." + this.props.reportType)
    }

    handleClickConfirm(callback) {
        Util.sendReport(this.props.reportType, Util.reportParameterValues(this.props.reportType))
        callback(true)
    }
}
