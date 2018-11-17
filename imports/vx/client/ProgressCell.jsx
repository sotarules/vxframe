import { Component } from "react"
import PropTypes from "prop-types"

export default class ProgressCell extends Component {

    static propTypes = {
        showProgress : PropTypes.bool.isRequired,
        showClear : PropTypes.bool,
        style : PropTypes.object,
        percentage : PropTypes.number,
        text : PropTypes.string,
        tooltip : PropTypes.string,
        onClickClear : PropTypes.func,
        progressClassName : PropTypes.string,
        stack : PropTypes.array
    }

    static defaultProps = {
        progressClassName : "progress-bar-success"
    }

    render() {
        return (
            <td className="table-cell-middle table-cell-center" style={this.props.style}>
                {this.props.showProgress &&
                    <div className="progress cell-progress-bar" title={this.props.tooltip}>
                        {this.props.stack ? this.renderStackedBars() : this.renderSingleBar()}
                        {this.props.showClear &&
                            <div className="cell-progress-clear"
                                onClick={this.props.onClickClear}>
                                <span className="fa fa-times"></span>
                            </div>
                        }
                    </div>
                }
            </td>
        )
    }

    renderSingleBar() {
        return (
            <div className={`progress-bar table-cell-center ${this.props.progressClassName || ""}`}
                role="progressbar"
                aria-valuenow={this.props.percentage}
                aria-valuemin="0"
                aria-valuemax="100"
                style={this.barStyle(this.props.percentage)}>
                {this.renderMainText(this.props.percentage)}
            </div>
        )
    }

    renderStackedBars() {
        let elements = this.props.stack.map((stackObject, index) => (
            <div key={`progress-bar-${index}`}
                className={`progress-bar table-cell-center ${stackObject.className || ""}`}
                role="progressbar"
                aria-valuenow={stackObject.percentage}
                aria-valuemin="0"
                aria-valuemax="100"
                style={this.barStyle(stackObject.percentage)}>
                {stackObject.text}
            </div>
        ))
        let percentage = _.reduce(this.props.stack, (memo, stackObject) => memo + stackObject.percentage, 0)
        elements.push(this.renderMainText(percentage))
        return elements
    }

    renderMainText(percentage) {
        if (!this.props.text) {
            return null
        }
        return (
            <span key="progress-main-text" className={`cell-progress-bar-text ${this.progressColorClass(percentage)}`}>
                {this.props.text}
            </span>
        )
    }

    barStyle(percentage) {
        return { width : percentage + "%" }
    }

    progressColorClass(percentage) {
        return percentage < 50 ? "cell-progress-bar-black" : "cell-progress-bar-white"
    }
}
