import { Component } from "react"
import PropTypes from "prop-types"
import RightPanel from "/imports/vx/client/RightPanel"
import EmptyRightPanel from "/imports/vx/client/EmptyRightPanel"
import RightHeader from "/imports/vx/client/RightHeader"
import VXForm from "/imports/vx/client/VXForm"
import VXFieldBox from "/imports/vx/client/VXFieldBox"
import EntityListHeader from "/imports/vx/client/EntityListHeader"
import UserEntityList from "/imports/vx/client/UserEntityList"

export default class DomainViewRight extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        domain : PropTypes.object,
        decorationIconClassName : PropTypes.string,
        decorationColor : PropTypes.oneOf(["blue"]),
        decorationTooltip : PropTypes.string,
        users : PropTypes.array,
        currentDomainId : PropTypes.string
    }

    static defaultProps = {
        id : "domain-view-right"
    }

    constructor(props) {
        super(props)
        this.locked = false
    }

    shouldComponentUpdate() {
        return !this.locked
    }

    setLocked(locked) {
        this.locked = locked
    }

    render() {
        return (
            <div id={this.props.id}
                className="flexi-grow lock-exiting-component">
                {this.props.domain ? (
                    <RightPanel>
                        <RightHeader iconUrl={Util.fetchDomainIconUrl(this.props.domain._id)}
                            name={this.props.domain.name}
                            description={this.props.domain.description}
                            decorationIconClassName={this.props.decorationIconClassName}
                            decorationColor={this.props.decorationColor}
                            decorationTooltip={this.props.decorationTooltip}
                            isShowButton={this.isShowMakeCurrent()}
                            buttonId="make-current"
                            buttonText={Util.i18n("common.button_make_current_domain")}
                            buttonClassName="btn btn-primary btn-custom pull-right"
                            onClickButton={this.handleMakeCurrent.bind(this)}>
                            <VXForm id="domain-view-right-form"
                                ref={(form) => { this.form = form }}
                                className="right-panel-form flexi-fixed">
                                <div className="row">
                                    <div className="col-xs-12">
                                        <VXFieldBox label={Util.i18n("common.label_billing_address")}
                                            value={this.props.domain.billingAddress1}/>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-xs-12">
                                        <VXFieldBox label={Util.i18n("common.label_billing_city")}
                                            value={this.props.domain.billingCity}/>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-xs-6">
                                        <VXFieldBox label={Util.i18n("common.label_billing_state")}
                                            value={this.props.domain.billingState}/>
                                    </div>
                                    <div className="col-xs-6">
                                        <VXFieldBox label={Util.i18n("common.label_billing_zip")}
                                            value={FX.zipUS.render(this.props.domain.billingZip)}/>
                                    </div>
                                </div>
                            </VXForm>
                        </RightHeader>
                        <EntityListHeader label={Util.i18n("my_domains.label_users_header")}/>
                        <UserEntityList id="domain-view-right-list"
                            users={this.props.users}
                            rightPanel={true}/>
                    </RightPanel>
                ) : (
                    <EmptyRightPanel emptyMessage={Util.i18n("common.empty_domain_rhs_details")}/>
                )}
            </div>
        )
    }

    isShowMakeCurrent() {
        return this.props.domain._id !== this.props.currentDomainId
    }

    handleMakeCurrent() {
        Meteor.call("setCurrentDomain", this.props.domain._id, (error, result) => {
            VXApp.refreshSessionSettingsAndGlobalSubscriptions(() => {
                UX.notify(result, error)
            })
        })
    }
}
