import React, { Component } from "react"
import PropTypes from "prop-types"
import { Spinner } from "spin.js"
import "spin.js/spin.css"

export default class ReactSpinner extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        className : PropTypes.string,
        text : PropTypes.string.isRequired,
        isActive: PropTypes.bool.isRequired,
        onClick : PropTypes.func.isRequired
    }

    static propTypes = {
        // This object is passed in wholesale as the spinner config
        config: PropTypes.object,
        // This is a quick way to overwrite just the color on the config
        color: PropTypes.string.isRequired
    }

    static defaultProps = {
        config: {},
        color: "black"
    }

    constructor(props) {
        super(props)
        this.containerRef = React.createRef()
    }

    componentDidMount() {
        const {color, config} = this.props
        const spinConfig = {
            // a few sensible defaults
            width: 2,
            radius: 10,
            length: 7,
            // color should not overwrite config
            color,
            // config will overwrite anything else
            ...config,
        }
        this.spinner = new Spinner(spinConfig)
        this.spinner.spin(this.containerRef.current)
    }

    componentWillUnmount() {
        this.spinner.stop();
    }

    render() {
        return <span ref={this.containerRef}/>
    }
}
