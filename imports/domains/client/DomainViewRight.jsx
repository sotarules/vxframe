import { Component } from "react"
import PropTypes from "prop-types"
import RightPanel from "/imports/vx/client/RightPanel.jsx"
import RightHeader from "/imports/vx/client/RightHeader.jsx"
import VXForm from "/imports/vx/client/VXForm.jsx"
import VXFieldBox from "/imports/vx/client/VXFieldBox.jsx"
import EntityListHeader from "/imports/vx/client/EntityListHeader.jsx"
import UserEntityList from "/imports/vx/client/UserEntityList.jsx"

export default class DomainViewRight extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        domain : PropTypes.object.isRequired,
        decorationIconClassName : PropTypes.string,
        decorationColor : PropTypes.oneOf(["blue"]),
        decorationTooltip : PropTypes.string,
        users : PropTypes.array.isRequired,
        currentDomainId : PropTypes.string.isRequired
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
                className="flexi-grow">
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
                                            value={this.props.domain.billingZip}/>
                                    </div>
                                </div>
                        </VXForm>
                    </RightHeader>
                    <EntityListHeader label={Util.i18n("my_domains.label_users_header")}/>
                    <UserEntityList id="domain-view-right-list"
                        users={this.props.users}
                        rightPanel={true}/>
                </RightPanel>
            </div>
        )
    }

    isShowMakeCurrent() {
        return this.props.domain._id !== this.props.currentDomainId
    }

    handleMakeCurrent(callback) {
        Meteor.call("setCurrentDomain", this.props.domain._id, (error, result) => {
            callback()
            UX.notify(result, error)
        })
    }
}
