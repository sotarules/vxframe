import { Component } from "react"
import PropTypes from "prop-types"

export default class VXDate extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        placeholder : PropTypes.string,
        label : PropTypes.string,
        star : PropTypes.bool,
        tooltip : PropTypes.string,
        required : PropTypes.bool,
        pickerClassName : PropTypes.string,
        value : PropTypes.instanceOf(Date),
        timezone : PropTypes.string,
        adjustFunction : PropTypes.string,
        adjustParameter : PropTypes.string,
        rule : PropTypes.func,
        format : PropTypes.string,
        popoverPlacement : PropTypes.string,
        extra : PropTypes.array,
        supplement : PropTypes.array,
        siblings : PropTypes.array,
        onChange : PropTypes.func,
        tandem : PropTypes.string,
        dbName : PropTypes.string,
        fetchHandler : PropTypes.func,
        updateHandler : PropTypes.func,
        invalidHandler : PropTypes.func,
        modifyHandler : PropTypes.func
    }

    static defaultProps = {
        popoverPlacement : "bottom",
        format : "MM/DD/YYYY HH:mm:ss"
    }

    constructor(props) {
        super(props)
        this.state = { value : Util.getNullAsEmpty(props.value), error : false, popoverText : null }
        this.originalState = Object.assign({}, this.state)
    }

    reset() {
        this.setState(this.originalState)
    }

    componentDidMount() {
        UX.register(this)
        let selector = this.getSelector()
        $(selector).datetimepicker({
            format: this.props.format,
            icons: CX.DATEPICKER_ICONS,
            showClear: true,
            useCurrent: false,
            focusOnShow: false
        })
        let dateString = moment.tz(this.props.value, this.props.timezone).format(this.props.format)
        $(selector).data("DateTimePicker").date(dateString)
        $(selector).on("dp.change", function(event) {
            let date
            let dateMoment = moment.tz(event.date, this.props.timezone)
            if (event.date) {
                if (this.props.adjustFunction) {
                    dateMoment = dateMoment[this.props.adjustFunction](this.props.adjustParameter)
                }
                date = dateMoment.toDate()
            }
            else {
                date = ""
            }
            OLog.debug("VXDate.jsx componentDidMount on dp.change componentId=" + this.props.id +
                " event.date=" + event.date + " date=" + date)
            this.setState({ value : date })
            UX.validateComponent(this)
            if (this.props.onChange) {
                this.props.onChange(event, this.getValue(), this)
            }
        }.bind(this))
    }

    componentWillReceiveProps(newProps) {
        if (UX.isFormReceiveProps(this) && newProps.hasOwnProperty("value")) {
            //OLog.debug("VXDate.jsx componentWillReceiveProps componentId=" + this.props.id + " value=" + newProps.value + " *update*")
            this.setValue(newProps.value)
        }
    }

    componentWillUnmount() {
        let selector = this.getSelector()
        //OLog.debug("VXDate.jsx componentWillUnmount selector=" + selector)
        $(selector).off("dp.change")
        $(selector).data("DateTimePicker").destroy()
        UX.unregister(this)
    }

    getValue() {
        return this.state.value
    }

    setValue(value) {
        this.setState({value: value}, () => {
            let selector = this.getSelector()
            let dateString = value ? moment.tz(value, this.props.timezone).format(this.props.format) : null
            OLog.debug("VXDate.jsx setValue componentId=" + this.props.id + " value=" + value + " dateString=" + dateString)
            $(selector).data("DateTimePicker").date(dateString)
        })
    }

    getSelector() {
        return "#" + this.props.id + "-picker"
    }

    render() {
        return (
            <div className={"form-group" + (this.state.error ? " " + CX.CLASS_HAS_ERROR : "")}>
                {this.props.label &&
                    <label htmlFor={this.props.id} className="control-label"  title={this.props.tooltip}>
                    {this.props.label}{" "}
                    {this.props.star &&
                        <span className="fa fa-star-o icon-required"></span>
                    }
                    </label>
                }
                <div id={this.props.id + "-picker"} className={`input-group date ${this.props.pickerClassName || ""}`}>
                    <input id={this.props.id} type="text" className="form-control" placeholder={this.props.placeholder}/>
                    <div className="input-group-btn">
                        <button className="btn btn-default add-on datepickerbutton" type="button">
                            <span className="fa fa-calendar"></span>
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}
