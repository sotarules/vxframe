import { Component } from "react"
import PropTypes from "prop-types"
import RadioButtonGroup from "/imports/vx/client/RadioButtonGroup"
import RadioButton from "/imports/vx/client/RadioButton"
import DomainEntityList from "/imports/vx/client/DomainEntityList"

export default class UserEditLeft extends Component {

    static propTypes = {
        domains : PropTypes.array.isRequired
    }

    render() {
        return (
            <div className="left-list-container flexi-grow">
                <RadioButtonGroup id="button-group-domains"
                    value="DOMAINS">
                    <RadioButton id="button-domains"
                        text={Util.i18n("common.label_domains")}
                        value="DOMAINS"/>
                </RadioButtonGroup>
                <DomainEntityList id="user-edit-left-list"
                    domains={this.props.domains}
                    selectable={true}
                    draggable={true}
                    multi={true}
                    dropClassName="domain-drop-list"/>
            </div>
        )
    }
}
