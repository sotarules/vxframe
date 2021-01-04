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
        //OLog.debug(`IOSButtonBar.jsx render state=${OLog.debugString(this.state)} props=${OLog.debugString(this.props)}`)
        const iosButtonState = this.props.iosState.iosButtonState
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
                                    {iosButtonState?.["ios-button-edit"]?.delegateVisible &&
                                        <IOSButton id="ios-button-edit"
                                            key="ios-button-edit"
                                            iconClass="fa-edit"
                                            showLoading={iosButtonState?.["ios-button-edit"]?.showLoading}
                                            minimumDuration={iosButtonState?.["ios-button-edit"]?.minimumDuration}
                                            title={Util.i18n("common.popup_menu_edit")}/>
                                    }
                                    {iosButtonState?.["ios-button-clone"]?.delegateVisible &&
                                        <IOSButton  id="ios-button-clone"
                                            key="ios-button-clone"
                                            iconClass="fa-copy"
                                            showLoading={iosButtonState?.["ios-button-clone"]?.showLoading}
                                            minimumDuration={iosButtonState?.["ios-button-clone"]?.minimumDuration}
                                            title={Util.i18n("common.popup_menu_clone")}/>
                                    }
                                    {iosButtonState?.["ios-button-delete"]?.delegateVisible &&
                                        <IOSButton id="ios-button-delete"
                                            key="ios-button-delete"
                                            iconClass="fa-times"
                                            showLoading={iosButtonState?.["ios-button-delete"]?.showLoading}
                                            minimumDuration={iosButtonState?.["ios-button-delete"]?.minimumDuration}
                                            title={Util.i18n("common.popup_menu_delete")}/>
                                    }
                                    {iosButtonState?.["ios-button-undo"]?.delegateVisible &&
                                        <IOSButton id="ios-button-undo"
                                            key="ios-button-undo"
                                            iconClass="fa-undo"
                                            showLoading={iosButtonState?.["ios-button-undo"]?.showLoading}
                                            minimumDuration={iosButtonState?.["ios-button-undo"]?.minimumDuration}
                                            title={Util.i18n("common.popup_menu_undo")}/>
                                    }
                                    {iosButtonState?.["ios-button-redo"]?.delegateVisible &&
                                        <IOSButton id="ios-button-redo"
                                            key="ios-button-redo"
                                            iconClass="fa-repeat"
                                            showLoading={iosButtonState?.["ios-button-redo"]?.showLoading}
                                            minimumDuration={iosButtonState?.["ios-button-redo"]?.minimumDuration}
                                            title={Util.i18n("common.popup_menu_redo")}/>
                                    }
                                    {iosButtonState?.["ios-button-print"]?.delegateVisible &&
                                        <IOSButton id="ios-button-print"
                                            key="ios-button-print"
                                            iconClass="fa-print"
                                            showLoading={iosButtonState?.["ios-button-print"]?.showLoading}
                                            minimumDuration={iosButtonState?.["ios-button-print"]?.minimumDuration}
                                            title={Util.i18n("common.popup_menu_print")}/>
                                    }
                                    {iosButtonState?.["ios-button-done-editing"]?.delegateVisible &&
                                        <IOSButton id="ios-button-done-editing"
                                            key="ios-button-done-editing"
                                            iconClass="fa-check-square-o"
                                            showLoading={iosButtonState?.["ios-button-done-editing"]?.showLoading}
                                            minimumDuration={iosButtonState?.["ios-button-done-editing"]?.minimumDuration}
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
