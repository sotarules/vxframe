import { Component } from "react"
import PropTypes from "prop-types"
import IOSButtonBarContainer from "/imports/layout/client/IOSButtonBarContainer"

export default class BasicPair extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        leftPanel : PropTypes.element.isRequired,
        rightPanel : PropTypes.element.isRequired,
        leftColumnClasses : PropTypes.string.isRequired,
        rightColumnClasses : PropTypes.string.isRequired
    }

    static defaultProps = {
        id : "vx-basic-pair"
    }

    render() {
        return (
            <div id={this.props.id} className="animation-panel flexi-grow">
                <IOSButtonBarContainer/>
                <div className="row conserve-space fill">
                    <div className={this.props.leftColumnClasses}>
                        {this.props.leftPanel}
                    </div>
                    <div className={this.props.rightColumnClasses}>
                        {this.props.rightPanel}
                    </div>
                </div>
            </div>
        )
    }
}
