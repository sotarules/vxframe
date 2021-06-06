import { Component } from "react"
import PropTypes from "prop-types"
import RadioButtonGroup from "/imports/vx/client/RadioButtonGroup"
import RadioButton from "/imports/vx/client/RadioButton"
import DomainEntityList from "/imports/vx/client/DomainEntityList"
import { setPublishCurrentDomain } from "/imports/vx/client/code/actions"

export default class DomainViewLeft extends Component {

    static propTypes = {
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
                    value="DOMAINS">
                    <RadioButton id="button-my-domains"
                        text={Util.i18n("common.label_my_domains")}
                        value="DOMAINS"/>
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
        let publishCurrentDomain = {}
        publishCurrentDomain.criteria = { _id : component.props.itemId }
        OLog.debug("DomainViewLeft.jsx handleSelect will select new domain publishCurrentDomain=" + OLog.debugString(publishCurrentDomain))
        Store.dispatch(setPublishCurrentDomain(publishCurrentDomain))
        if (UX.isSlideMode()) {
            UX.iosMinorPush("common.button_my_domains", "RIGHT")
        }
    }
}
