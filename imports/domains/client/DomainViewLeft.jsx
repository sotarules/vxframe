import { Component } from "react"
import PropTypes from "prop-types"
import RadioButtonGroup from "/imports/vx/client/RadioButtonGroup.jsx"
import RadioButton from "/imports/vx/client/RadioButton.jsx"
import DomainEntityList from "/imports/vx/client/DomainEntityList.jsx"

export default class DomainViewLeft extends Component {

    static PropTypes = {
        id : PropTypes.string.isRequired,
        domains : PropTypes.array.isRequired,
        currentDomainId : PropTypes.string.isRequired
    }

    static defaultProps = {
        id : "domain-view-left"
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
                className="left-list-container flexi-grow">
                <RadioButtonGroup id="button-group-my-domains"
                        activeButtonId="button-my-domains">
                    <RadioButton id="button-my-domains"
                        text={Util.i18n("common.label_my_domains")}/>
                </RadioButtonGroup>
                <DomainEntityList id="domain-view-left-list"
                    domains={this.props.domains}
                    currentDomainId={this.props.currentDomainId}
                    selectable={true}
                    chevrons={true}
                    onSelect={this.handleSelectDomain.bind(this)}/>
            </div>
        )
    }

    handleSelectDomain(event, component) {
        let currentRequest = {};
        currentRequest.criteria = { _id : component.props._id };
        OLog.debug("DomainViewLeft.jsx handleSelect will select new domain currentRequest=" + OLog.debugString(currentRequest));
        Session.set("PUBLISH_CURRENT_DOMAIN", currentRequest);
        if (UX.isSlideMode(true)) {
            UX.iosMinorPush("common.button_my_domains", "RIGHT");
        }
    }
}
