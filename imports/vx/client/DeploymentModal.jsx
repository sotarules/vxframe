import { Component } from "react"
import PropTypes from "prop-types"
import VXModal from "/imports/vx/client/VXModal"
import ModalHeaderImage from "/imports/vx/client/ModalHeaderImage"
import ModalBody from "/imports/vx/client/ModalBody"
import ModalFooterConfirm from "/imports/vx/client/ModalFooterConfirm"
import VXForm from "/imports/vx/client/VXForm"
import VXSelect from "/imports/vx/client/VXSelect"
import VXCheck from "/imports/vx/client/VXCheck"
import VXTextArea from "/imports/vx/client/VXTextArea"
import VXAnchor from "/imports/vx/client/VXAnchor"

export default class DeploymentModal extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
    }

    static defaultProps = {
        id : "deployment-modal"
    }

    constructor(props) {
        super(props)
        this.state = {
            deploymentAction : "",
            sourceTenant : Util.getCurrentTenantId(),
            sourceDomain : "",
            targetTenant : Util.getCurrentTenantId(),
            targetDomain : "",
            copyDomainSettings : false,
            copyDeploymentCollections : false,
            snapshotIndex : "",
            deploymentMessage : "",
            issuesMessage : "",
            snapshotArray : [] }
        console.log(`constructor state=${JSON.stringify(this.state)}`)
    }

    render() {
        return (
            <VXModal id={this.props.id} width="550px">
                <ModalHeaderImage imageUrl={CX.CLOUDFILES_PREFIX + "/img/system/deployment.png"}
                    heading={Util.i18n("common.label_deployment")}/>
                <ModalBody>
                    <VXForm id="component-deployment-modal-form"
                        elementType="div"
                        receiveProps={true}
                        ref={(form) => { this.form = form }}>
                        {this.renderBody()}
                    </VXForm>
                </ModalBody>
                <ModalFooterConfirm onClickConfirm={this.handleClickConfirm.bind(this)}/>
                <VXAnchor id="deployment-modal-anchor"/>
            </VXModal>
        )
    }

    renderBody() {
        return (
            <>
                <div className="row">
                    <div className="col-xs-12">
                        <VXSelect id="deploymentAction"
                            codeArray={UX.makeCodeArray("deploymentAction", true)}
                            label={Util.i18n("common.label_deployment_action")}
                            tooltip={Util.i18n("common.tooltip_deployment_action")}
                            required={true}
                            value={this.state.deploymentAction}
                            onChange={this.handleChangeDeploymentAction.bind(this)} />
                    </div>
                </div>
                {this.state.deploymentAction === "COPY" &&
                    <>
                        <div className="row">
                            <div className="col-xs-12">
                                <VXSelect id="sourceTenant"
                                    codeArray={UX.addBlankSelection(this.makeTenantArray())}
                                    label={Util.i18n("common.label_source_tenant")}
                                    tooltip={Util.i18n("common.tooltip_source_tenant")}
                                    required={true}
                                    value={this.state.sourceTenant}
                                    onChange={this.handleChangeSourceTenant.bind(this)}/>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-xs-12">
                                <VXSelect id="sourceDomain"
                                    codeArray={UX.addBlankSelection(this.makeDomainArray(this.state.sourceTenant))}
                                    label={Util.i18n("common.label_source_domain")}
                                    tooltip={Util.i18n("common.tooltip_source_domain")}
                                    required={true}
                                    value={this.state.sourceDomain}
                                    onChange={this.handleChangeSourceDomain.bind(this)}/>
                            </div>
                        </div>
                    </>
                }
                <div className="row">
                    <div className="col-xs-12">
                        <VXSelect id="targetTenant"
                            codeArray={UX.addBlankSelection(this.makeTenantArray())}
                            label={Util.i18n("common.label_target_tenant")}
                            tooltip={Util.i18n("common.tooltip_target_tenant")}
                            required={true}
                            value={this.state.targetTenant}
                            onChange={this.handleChangeTargetTenant.bind(this)}/>
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-12">
                        <VXSelect id="targetDomain"
                            codeArray={UX.addBlankSelection(this.makeDomainArray(this.state.targetTenant))}
                            label={Util.i18n("common.label_target_domain")}
                            tooltip={Util.i18n("common.tooltip_target_domain")}
                            required={true}
                            value={this.state.targetDomain}
                            onChange={this.handleChangeTargetDomain.bind(this)}/>
                    </div>
                </div>
                {this.state.deploymentAction === "COPY" &&
                    <>
                        <div className="row margin-top-10">
                            <div className="col-sm-6">
                                <VXCheck id="copyDeploymentCollections"
                                    label={Util.i18n("common.label_copy_deployment_collections")}
                                    checked={this.state.copyDeploymentCollections}/>
                            </div>
                            <div className="col-sm-6">
                                <VXCheck id="copyDomainSettings"
                                    label={Util.i18n("common.label_copy_domain_settings")}
                                    checked={this.state.copyDomainSettings}/>
                            </div>
                        </div>
                    </>
                }
                {this.state.deploymentAction === "COPY" && this.state.issuesMessage &&
                    <div className="row">
                        <div className="col-xs-12">
                            <VXTextArea id="issuesMessage"
                                label={Util.i18n("common.label_issues_message")}
                                formGroupClassName="margin-top-20"
                                value={this.state.issuesMessage}
                                rows={4}
                                resize={false}/>
                        </div>
                    </div>
                }
                {this.state.deploymentAction === "RESTORE" &&
                    <>
                        <div className="row">
                            <div className="col-xs-12">
                                <VXSelect id="snapshotIndex"
                                    codeArray={this.state.snapshotArray}
                                    label={Util.i18n("common.label_snapshot_to_restore")}
                                    tooltip={Util.i18n("common.tooltip_snapshot_to_restore")}
                                    required={true}
                                    value={this.state.snapshotIndex}
                                    onChange={this.handleChangeSnapshotIndex.bind(this)}/>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-xs-12">
                                <VXTextArea id="deploymentMessage"
                                    label={Util.i18n("common.label_deployment_message")}
                                    formGroupClassName="margin-top-20"
                                    value={this.state.deploymentMessage}
                                    rows={4}
                                    resize={false}/>
                            </div>
                        </div>
                    </>
                }
            </>
        )
    }

    makeTenantArray() {
        if (!Util.isUserSuperAdmin()) {
            const tenantId = Util.getCurrentTenantId()
            const tenantName = Util.fetchTenantName(tenantId)
            return [ { code: tenantId, localized: tenantName } ]
        }
        return VXApp.makeTenantArray()
    }

    makeDomainArray(tenantId) {
        if (!Util.isUserSuperAdmin()) {
            return VXApp.makeDomainArray()
        }
        return VXApp.makeDomainArrayForTenant(tenantId)
    }

    handleChangeDeploymentAction(event, deploymentAction) {
        console.log(`handleChangeDeploymentAction state=${JSON.stringify(this.state)}`)
        this.setState({ deploymentAction,
            sourceTenant : Util.getCurrentTenantId(),
            sourceDomain : "",
            targetTenant : Util.getCurrentTenantId(),
            targetDomain : "",
            snapshotIndex : "",
            deploymentMessage : "",
            issuesMessage : "",
            snapshotArray : []
        })
    }

    handleChangeSourceTenant(event, sourceTenant) {
        this.setState({ sourceTenant, sourceDomain: "" })
    }

    handleChangeSourceDomain(event, sourceDomain) {
        this.setState({ sourceDomain })
    }

    handleChangeTargetTenant(event, targetTenant) {
        this.setState({ targetTenant, targetDomain: "" })
    }

    async handleChangeTargetDomain(event, targetDomain) {
        this.setState({ targetDomain })
        if (this.state.deploymentAction !== "RESTORE") {
            return
        }
        try {
            const formObject = UX.makeFormObject(this.form)
            const result = await UX.call("makeSnapshotArray", formObject)
            if (result.success) {
                this.setState( { snapshotArray : result.snapshotArray } )
            }
        }
        catch (error) {
            UX.notifyForError(error)
        }
    }

    async handleChangeSnapshotIndex(event, snapshotIndex) {
        this.setState({ snapshotIndex })
        try {
            const formObject = UX.makeFormObject(this.form)
            const result = await UX.call("deploymentMessage", formObject)
            if (result.success) {
                this.setState( { deploymentMessage : Util.i18n(result.key, result.variables) } )
            }
        }
        catch (error) {
            UX.notifyForError(error)
        }
    }

    async handleClickConfirm(callback) {
        try {
            if (!UX.checkForm(this.form)) {
                callback(false)
                return
            }
            const formObject = UX.makeFormObject(this.form)
            if (formObject.deploymentAction === "COPY" && formObject.sourceDomain === formObject.targetDomain) {
                UX.notify({ success: false, icon: "TRIANGLE", key: "common.alert_deployment_same_source_target" })
                callback(false)
                return
            }
            if (formObject.deploymentAction === "COPY") {
                const result = await UX.call("checkSourceDomainNames", formObject)
                if (!result.success) {
                    this.setState( { issuesMessage : Util.i18n(result.key, result.variables) } )
                    callback(false)
                    return
                }
            }
            const result = await UX.call("executeDeploymentAction", formObject)
            if (result.success) {
                if (formObject.targetDomain === Util.getCurrentDomainId(Meteor.userId())) {
                    VXApp.refreshSessionSettingsAndGlobalSubscriptions(() => {
                        callback(true)
                        Meteor.setTimeout(() => {
                            UX.notify(result)
                        }, 1000)
                    })
                    return
                }
            }
            callback(true)
            UX.notify(result)
        }
        catch (error) {
            UX.notifyForError(error)
            callback(false)
        }
    }
}
