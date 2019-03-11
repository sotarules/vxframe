import { Component } from "react"
import PropTypes from "prop-types"
import WizardFooter from "/imports/vx/client/WizardFooter"

export default class WizardPanel extends Component {

    static propTypes = {
        children: PropTypes.node,
        className: PropTypes.string,
        finishText : PropTypes.string
    }

    render() {
        return (
            <div  className={`wizard-panel ${this.props.className || ""}`}>
                {this.props.children}
                <WizardFooter wizardState={this.props.wizardState}
                    isVisiblePrevious={this.isVisiblePrevious.bind(this)}
                    isVisibleNext={this.isVisibleNext.bind(this)}
                    isVisibleFinish={this.isVisibleFinish.bind(this)}
                    finishText={this.props.finishText}/>
            </div>
        )
    }

    isVisiblePrevious() {
        return this.props.wizardState.currentIndex > 0
    }

    isVisibleNext() {
        return this.props.wizardState.currentIndex < (this.props.wizardState.panelCount - 1)
    }

    isVisibleFinish() {
        return this.props.wizardState.currentIndex === (this.props.wizardState.panelCount - 1)
    }
}
