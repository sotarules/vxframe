import { Component } from "react"
import PropTypes from "prop-types"
import RadioButtonGroup from "/imports/vx/client/RadioButtonGroup.jsx"
import RadioButton from "/imports/vx/client/RadioButton.jsx"
import DomainEntityList from "/imports/vx/client/DomainEntityList.jsx"

export default class UserEditLeft extends Component {

    static PropTypes = {
        domains : PropTypes.array.isRequired
    }

    render() {
        return (
            <div className="left-list-container flexi-grow">
                <RadioButtonGroup id="button-group-domains"
                        activeButtonId="button-domains">
                    <RadioButton id="button-domains"
                        text={Util.i18n("common.label_domains")}/>
                </RadioButtonGroup>
                <DomainEntityList id="user-edit-left-list"
                    domains={this.props.domains}
                    draggable={true}
                    dragClassName="domain-drag-list"
                    dropClassName="domain-drop-list"
                    selectable={false}/>
            </div>
        )
    }
}
