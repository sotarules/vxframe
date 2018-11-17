import { Component } from "react"
import PropTypes from "prop-types"
import RightPanel from "/imports/vx/client/RightPanel.jsx"
import RightBody from "/imports/vx/client/RightBody.jsx"
import RightHeader from "/imports/vx/client/RightHeader.jsx"
import VXForm from "/imports/vx/client/VXForm.jsx"
import VXInput from "/imports/vx/client/VXInput.jsx"
import VXTextArea from "/imports/vx/client/VXTextArea.jsx"

export default class TemplateEditRight extends Component {

    static propTypes = {
        template : PropTypes.object.isRequired,
        decorationIconClassName : PropTypes.string,
        decorationColor : PropTypes.oneOf(["green", "yellow", "red", "gray"]),
        decorationTooltip : PropTypes.string,
        isShowButton : PropTypes.bool,
        buttonId : PropTypes.string,
        buttonText : PropTypes.string,
        buttonClassName : PropTypes.string
    }

    componentDidMount() {
        UX.registerIosButtonDelegate("ios-button-done-editing", this.handleDoneEditing.bind(this))
    }

    render() {
        return (
            <RightPanel>
                <RightHeader iconUrl={CX.CLOUDFILES_PREFIX + "/img/system/template5.png"}
                    name={this.props.template.name}
                    description={this.props.template.description}
                    message={this.props.template.message}
                    decorationIconClassName={this.props.decorationIconClassName}
                    decorationColor={this.props.decorationColor}
                    decorationTooltip={this.props.decorationTooltip}
                    isShowButton={true}
                    buttonId="button-send-test-email"
                    buttonText={Util.i18n("common.button_send_test_email")}
                    buttonClassName="btn btn-primary btn-custom pull-right"
                    onClickButton={this.handleClickSendTestEmail.bind(this)}/>
                <RightBody className="right-body-no-margin-top">
                    <VXForm id="template-edit-right-form"
                        ref={(form) => { this.form = form }}
                        className="right-panel-form flexi-grow"
                        dynamic={true}
                        collection={Templates}
                        _id={this.props.template._id}>
                        <div className="flexi-fixed">
                            <VXInput id="name"
                                label={Util.i18n("common.label_name")}
                                value={this.props.template.name}
                                rule={VX.common.name}/>
                        </div>
                        <div className="flexi-fixed">
                            <VXInput id="description"
                                label={Util.i18n("common.label_description")}
                                value={this.props.template.description}
                                rule={VX.common.name}/>
                        </div>
                        <div className="flexi-fixed">
                            <VXInput id="subject"
                                label={Util.i18n("common.label_subject")}
                                value={this.props.template.subject}/>
                        </div>
                        <div className="flexi-grow">
                            <VXTextArea id="html"
                                label={Util.i18n("common.label_html")}
                                formGroupClassName=" flexi-grow"
                                className="flex-section-grow fill text-area-resize scroll-both scroll-momentum"
                                value={this.props.template.html}/>
                        </div>
                    </VXForm>
                </RightBody>
            </RightPanel>
        )
    }

    handleDoneEditing() {
        OLog.debug("TemplateEditRight.jsx handleDoneEditing")
        UX.iosPopAndGo("crossfade")
    }

    handleClickSendTestEmail(callback) {
        Meteor.call("sendTestEmail", this.props.template._id, (error, result) => {
            callback()
            UX.notify(result, error)
        })
    }
}
