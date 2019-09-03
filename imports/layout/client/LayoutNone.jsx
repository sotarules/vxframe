import { Component } from "react"

import PropTypes from "prop-types"
import VXAnchor from "/imports/vx/client/VXAnchor"
import LoadingSpinner from "/imports/vx/client/LoadingSpinner"

export default class LayoutNone extends Component {

    static propTypes = {
        loading : PropTypes.bool
    }

    render() {
        if (this.props.loading) {
            return (<LoadingSpinner/>)
        }
        return (
            <div className="flexi-grow overflow-hidden">
                {this.props.children}
                <VXAnchor/>
            </div>
        )
    }
}
