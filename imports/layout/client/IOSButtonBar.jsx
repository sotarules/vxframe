import { Component } from "react";
import PropTypes from "prop-types";
import IOSBackButton from "/imports/layout/client/IOSBackButton";
import IOSButton from "/imports/layout/client/IOSButton";

export default class IOSButtonBar extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        isButtonBarVisible : PropTypes.bool.isRequired,
        isBackVisible : PropTypes.bool.isRequired,
        isEditVisible : PropTypes.bool.isRequired,
        isCloneVisible : PropTypes.bool.isRequired,
        isDeleteVisible : PropTypes.bool.isRequired,
        isDoneEditingVisible : PropTypes.bool.isRequired
    }

    static defaultProps = {
        id : "ios-button-bar"
    }

    constructor(props) {
        super(props)
        this.state = { isButtonBarVisible : props.isButtonBarVisible }
        this.locked = false
    }

    componentDidMount() {
        Meteor.setTimeout(() => {
            $(".fade-ios").addClass("fire")
        }, 350)
    }

    componentWillReceiveProps(newProps) {
        this.setState({ isButtonBarVisible : newProps.isButtonBarVisible })
    }

    shouldComponentUpdate() {
        return !this.locked
    }

    setLocked(locked) {
        this.locked = locked
    }

    render() {
        OLog.debug("IOSButtonBar.jsx render state=" + OLog.debugString(this.state) + " props=" + OLog.debugString(this.props))
        return (
            <div id={this.props.id} className={this.className()}>
                {this.state.isButtonBarVisible &&
                    <div className="row">
                        <div className="col-sm-12">
                            <div>
                                {this.props.isBackVisible &&
                                    <IOSBackButton id="ios-button-back"
                                        backLabel={this.props.backLabel}/>
                                }
                                <div className="ios-button-group pull-right">
                                    {this.props.isEditVisible &&
                                        <IOSButton id="ios-button-edit"
                                            key="ios-button-edit"
                                            iconClass="fa-edit"
                                            title={Util.i18n("common.popup_menu_edit")}/>
                                    }
                                    {this.props.isCloneVisible &&
                                        <IOSButton  id="ios-button-clone"
                                            key="ios-button-clone"
                                            iconClass="fa-copy"
                                            title={Util.i18n("common.popup_menu_clone")}/>
                                    }
                                    {this.props.isDeleteVisible &&
                                        <IOSButton id="ios-button-delete"
                                            key="ios-button-delete"
                                            iconClass="fa-times"
                                            title={Util.i18n("common.popup_menu_delete")}/>
                                    }
                                    {this.props.isDoneEditingVisible &&
                                        <IOSButton id="ios-button-done-editing"
                                            key="ios-button-done-editing"
                                            iconClass="fa-check-square-o"
                                            title={Util.i18n("common.popup_menu_done_editing")}/>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </div>
        )
    }

    className() {
        return "flexi-fixed not-selectable " + (this.state.isButtonBarVisible ? "ios-button-bar" : "ios-button-bar-placeholder")
    }
}
