import { Component } from "react"
import PropTypes from "prop-types"
import RightPanel from "/imports/vx/client/RightPanel"
import RightBody from "/imports/vx/client/RightBody"
import VXForm from "/imports/vx/client/VXForm"
import VXFieldSet from "/imports/vx/client/VXFieldSet"
import VXSelect from "/imports/vx/client/VXSelect"
import FooterCancelSave from "/imports/vx/client/FooterCancelSave"

export default class SettingsSystem extends Component {

    static propTypes = {
        user : PropTypes.object.isRequired,
        config : PropTypes.object.isRequired,
        logLevels : PropTypes.array.isRequired
    }

    render() {
        return (
            <RightPanel>
                <RightBody>
                    <VXForm id="settings-system-form"
                        ref={(form) => { this.form = form }}
                        className="right-panel-form flexi-grow"
                        dynamic={false}
                        collection={Config}
                        receiveProps={false}
                        _id={"1"}>
                        <VXFieldSet legend={Util.i18n("system_settings.label_system_settings")}>
                            <div className="row">
                                <div className="col-sm-4">
                                    <VXSelect id="logLevel"
                                        codeArray={this.props.logLevels}
                                        label={Util.i18n("system_settings.label_system_server_log_level")}
                                        tooltip={Util.i18n("system_settings.tooltip_system_server_log_level")}
                                        required={true}
                                        bindingType="Integer"
                                        value={this.props.config.logLevel}/>
                                </div>
                            </div>
                        </VXFieldSet>
                    </VXForm>
                </RightBody>
                <FooterCancelSave ref={(footer) => {this.footer = footer} }
                    id="right-panel-footer"
                    onReset={this.onReset.bind(this)}
                    onSave={this.onSave.bind(this)}
                />
            </RightPanel>
        )
    }

    onReset() {
        UX.resetForm(this.form)
    }

    onSave(callback) {
        UX.save(this.form, callback)
    }
}
