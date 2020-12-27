import { Component } from "react";
import PropTypes from "prop-types";

export default class IOSButton extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        iconClass : PropTypes.string.isRequired,
        title : PropTypes.string.isRequired,
        showLoading : PropTypes.bool,
        minimumDuration: PropTypes.number,
    }

    static defaultProps = {
        minimumDuration : 350,
        showLoading : false
    }

    constructor(props) {
        super(props)
        this.state = { loading: false }
    }

    componentDidMount() {
        this._isMounted = true
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    render() {
        return (
            <div id={this.props.id}
                className="ios-button-group-member flex-section flex-section-fixed"
                title={this.props.title}
                onClick={this.handleClick.bind(this)}>
                <span className={`ios-button-link ios-button-icon fa ${this.iconClass()}`}/>
                <div className="ios-button-hotzone"/>
            </div>
        )
    }

    iconClass() {
        return !this.state.loading ? this.props.iconClass : "fa-spin fa-spinner"
    }

    handleClick() {
        OLog.debug(`IOSButton.jsx handleClick id=${this.props.id}`)
        if (!_.isFunction(UXState[this.props.id])) {
            OLog.error(`IOSButton.jsx handleClick id=${this.props.id} no delegate has been registered`)
            return
        }
        if (!this.props.showLoading) {
            this.execute()
            return
        }
        const minimumDuration = this.props.showLoading ? this.props.minimumDuration : 0
        OLog.debug(`IOSButton.jsx handleClick id=${this.props.id} *loading* for minimumDuration=${minimumDuration}`)
        this.setState({ loading: true }, () => {
            this.execute()
            Meteor.setTimeout(() => {
                if (this._isMounted) {
                    this.setState( { loading: false } )
                }
            }, minimumDuration)
        })
    }

    execute() {
        UX.iosDisable(`#${this.props.id}`)
        UXState[this.props.id](() => {
            UX.iosEnable(`#${this.props.id}`)
        }, event, this)
    }
}
