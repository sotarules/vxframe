import { Component } from "react"
import PropTypes from "prop-types"
import WizardFooter from "/imports/vx/client/WizardFooter"

export default class WizardPanel extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        children: PropTypes.node,
        style: PropTypes.object,
        className: PropTypes.string,
        finishText : PropTypes.string,
        isVisiblePrevious : PropTypes.func.isRequired,
        isVisibleNext : PropTypes.func.isRequired,
        isVisibleFinish : PropTypes.func.isRequired,
        onPrevious : PropTypes.func,
        onNext : PropTypes.func,
        onFinish : PropTypes.func
    }

    render() {
        return (
            <div id={this.props.id}
                className={`wizard-panel ${this.props.className || ""}`}
                style={this.props.style}>
                {this.props.children}
                <WizardFooter wizardState={this.props.wizardState}
                    isVisiblePrevious={this.props.isVisiblePrevious}
                    isVisibleNext={this.props.isVisibleNext}
                    isVisibleFinish={this.props.isVisibleFinish}
                    finishText={this.props.finishText}
                    onNext={this.props.onNext}
                    onPrevious={this.props.onPrevious}
                    onFinish={this.props.onFinish} />
            </div>
        )
    }
}
