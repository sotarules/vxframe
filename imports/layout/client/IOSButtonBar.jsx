import { Component } from "react";
import PropTypes from "prop-types";
import IOSBackButton from "/imports/layout/client/IOSBackButton";
import IOSButton from "/imports/layout/client/IOSButton";

export default class IOSButtonBar extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        iosState : PropTypes.object.isRequired
    }

    static defaultProps = {
        id : "ios-button-bar"
    }

    static getDerivedStateFromProps(newProps) {
        return { isButtonBarVisible : UX.isIosButtonBarVisible(newProps.iosState) }
    }

    constructor(props) {
        super(props)
        this.state = { isButtonBarVisible : UX.isIosButtonBarVisible(props.iosState) }
        this.locked = false
    }

    shouldComponentUpdate() {
        return !this.locked
    }

    setLocked(locked) {
        this.locked = locked
    }

    render() {
        OLog.debug(`IOSButtonBar.jsx render state=${OLog.debugString(this.state)} props=${OLog.debugString(this.props)}`)
        const delegatesVisible = this.props.iosState.delegatesVisible || {}
        return (
            <div id={this.props.id} className={this.className()}>
                {this.state.isButtonBarVisible &&
                    <div className="row">
                        <div className="col-sm-12">
                            <div>
                                {UX.isIosBackButtonVisible(this.props.iosState) &&
                                    <IOSBackButton id="ios-button-back"
                                        backLabel={UX.backLabel(this.props.iosState)}/>
                                }
                                <div className="ios-button-group pull-right">
                                    {delegatesVisible["ios-button-edit"] &&
                                        <IOSButton id="ios-button-edit"
                                            key="ios-button-edit"
                                            iconClass="fa-edit"
                                            title={Util.i18n("common.popup_menu_edit")}/>
                                    }
                                    {delegatesVisible["ios-button-clone"] &&
                                        <IOSButton  id="ios-button-clone"
                                            key="ios-button-clone"
                                            iconClass="fa-copy"
                                            title={Util.i18n("common.popup_menu_clone")}/>
                                    }
                                    {delegatesVisible["ios-button-delete"] &&
                                        <IOSButton id="ios-button-delete"
                                            key="ios-button-delete"
                                            iconClass="fa-times"
                                            title={Util.i18n("common.popup_menu_delete")}/>
                                    }
                                    {delegatesVisible["ios-button-undo"]  &&
                                        <IOSButton id="ios-button-undo"
                                            key="ios-button-undo"
                                            iconClass="fa-undo"
                                            title={Util.i18n("common.popup_menu_undo")}/>
                                    }
                                    {delegatesVisible["ios-button-redo"] &&
                                        <IOSButton id="ios-button-redo"
                                            key="ios-button-redo"
                                            iconClass="fa-repeat"
                                            title={Util.i18n("common.popup_menu_redo")}/>
                                    }
                                    {delegatesVisible["ios-button-done-editing"] &&
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
        return `flexi-fixed not-selectable hidden-print lock-exiting-component ${(this.state.isButtonBarVisible ?
            "ios-button-bar" : "ios-button-bar-placeholder")}`
    }
}
