import {Component} from "react";
import PropTypes from "prop-types";

export default class IOSButton extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        position : PropTypes.string.isRequired,
        iconClass : PropTypes.string.isRequired,
        iconStyle : PropTypes.object.isRequired,
        title : PropTypes.string.isRequired,
        showLoading : PropTypes.bool,
        minimumDuration: PropTypes.number
    }

    static defaultProps = {
        position : "right",
        iconStyle : { fontSize: "18px", lineHeight: "20px" },
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
                className={`ios-button-group-member ios-button-group-member-${this.props.position} ` +
                    "flex-section flex-section-fixed"}
                title={this.props.title}
                onClick={this.handleClick.bind(this)}>
                <span className={`ios-button-link ios-button-icon fa ${this.iconClass()}`}
                    style={this.props.iconStyle}/>
                <div className="ios-button-hotzone"/>
            </div>
        )
    }

    iconClass() {
        return !this.state.loading ? this.props.iconClass : "fa-spin fa-spinner"
    }

    handleClick(event) {
        OLog.debug(`IOSButton.jsx handleClick id=${this.props.id}`)
        if (!_.isFunction(UXState[this.props.id])) {
            OLog.error(`IOSButton.jsx handleClick id=${this.props.id} no delegate has been registered`)
            return
        }
        if (!this.props.showLoading) {
            this.execute(event)
            return
        }
        const minimumDuration = this.props.showLoading ? this.props.minimumDuration : 0
        OLog.debug(`IOSButton.jsx handleClick id=${this.props.id} *loading* for minimumDuration=${minimumDuration}`)
        this.setState({ loading: true }, () => {
            UX.iosDisable(`#${this.props.id}`)
            Meteor.setTimeout(() => {
                if (this._isMounted) {
                    this.execute()
                }
            }, minimumDuration)
        })
    }

    execute() {
        UXState[this.props.id](() => {
            this.setState({ loading: false }, () => {
                UX.iosEnable(`#${this.props.id}`)
            })
        }, event, this)
    }
}
