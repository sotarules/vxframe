import { Component } from "react"
import PropTypes from "prop-types"
import VXButton from "/imports/vx/client/VXButton"

export default class WizardFooter extends Component {

    static propTypes = {
        isVisiblePrevious : PropTypes.func.isRequired,
        isVisibleNext : PropTypes.func.isRequired,
        isVisibleFinish : PropTypes.func.isRequired,
        onNext : PropTypes.func,
        onPrevious : PropTypes.func,
        onFinish : PropTypes.func,
        finishText : PropTypes.string
    }

    render() {
        return (
            <div className="wizard-footer flex-section-fixed">
                <div className="row">
                    <div className="col-sm-12 margin-top-10">
                        <div className="pull-right">
                            {this.props.isVisiblePrevious() &&
                                <VXButton id="button-previous"
                                    className="btn btn-primary btn-custom btn-bottom btn-margin-left"
                                    onClick={this.handleClickPrevious.bind(this)}>
                                    <span className="fa fa-chevron-left wizard-button-chevron-left"></span>
                                    {Util.i18n("common.button_previous")}
                                </VXButton>
                            }
                            {this.props.isVisibleNext() &&
                                <VXButton id="button-next"
                                    className="btn btn-primary btn-custom btn-bottom btn-margin-left"
                                    onClick={this.handleClickNext.bind(this)}>
                                    {Util.i18n("common.button_next")}
                                    <span className="fa fa-chevron-right wizard-button-chevron-right"></span>
                                </VXButton>
                            }
                            {this.props.isVisibleFinish() &&
                                <VXButton id="button-finish"
                                    className="btn btn-primary btn-custom btn-bottom btn-margin-left"
                                    onClick={this.handleClickFinish.bind(this)}>
                                    {Util.i18n(this.props.finishText ? this.props.finishText : "common.button_finish")}
                                </VXButton>
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    handleClickPrevious(laddaCallback) {
        OLog.debug("WizardFooter.jsx handleClickPrevious user=" + Util.getUserEmail() + " wizardState=" + OLog.debugString(this.props.wizardState))
        UX.setAnimation("use-wizard-page", "slideright")
        if (this.props.onPrevious) {
            this.props.onPrevious(laddaCallback)
        }
    }

    handleClickNext(laddaCallback) {
        OLog.debug("WizardFooter.jsx handleClickNext user=" + Util.getUserEmail() + " wizardState=" + OLog.debugString(this.props.wizardState))
        UX.setAnimation("use-wizard-page", "slideleft")
        if (this.props.onNext) {
            this.props.onNext(laddaCallback)
        }
    }

    handleClickFinish(laddaCallback) {
        OLog.debug("WizardFooter.jsx handleClickFinish user=" + Util.getUserEmail() + " wizardState=" + OLog.debugString(this.props.wizardState))
        UX.setAnimation("use-wizard-page", null)
        if (this.props.onFinish) {
            this.props.onFinish(laddaCallback)
        }
    }
}
