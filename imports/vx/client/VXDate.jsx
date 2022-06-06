import { Component } from "react"
import PropTypes from "prop-types"

export default class VXDate extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        placeholder : PropTypes.string,
        label : PropTypes.string,
        groupClass : PropTypes.string,
        star : PropTypes.bool,
        tooltip : PropTypes.string,
        required : PropTypes.bool,
        pickerClassName : PropTypes.string,
        value : PropTypes.instanceOf(Date),
        timezone : PropTypes.string,
        adjustFunction : PropTypes.string,
        adjustParameter : PropTypes.string,
        startOfDay : PropTypes.bool,
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
        modifyHandler : PropTypes.func,
        showButton : PropTypes.bool
    }

    static defaultProps = {
        popoverPlacement : "bottom",
        format : "MM/DD/YYYY hh:mm:ss A",
        showButton : true,
    }

    constructor(props) {
        super(props)
        this.state = { value : Util.getNullAsEmpty(props.value), error : false, popoverText : null }
        this.originalState = Object.assign({}, this.state)
        this.timezone = props.timezone || Util.getUserTimezone(Meteor.userId())
    }

    reset() {
        this.setState(this.originalState)
    }

    componentDidMount() {
        UX.register(this)
        this.initDatePicker()
    }

    componentDidUpdate() {
        this.initDatePicker()
    }

    initDatePicker() {
        const selector = this.getSelector()
        if ($(selector).data("DateTimePicker")) {
            return
        }
        $(selector).datetimepicker({
            format: this.props.format,
            dayViewHeaderFormat: this.props.format,
            icons: CX.DATEPICKER_ICONS,
            showClear: true,
            useCurrent: false,
            focusOnShow: false
        })
        if (this.props.value) {
            const dateString = moment.tz(this.props.value, this.timezone).format(this.props.format)
            $(selector).data("DateTimePicker").date(dateString)
        }
        $(selector).on("dp.change", function(event) {
            let dateMoment = !this.props.startOfDay ?
                moment.tz(event.date, this.timezone) :
                moment.tz(event.date, this.timezone).startOf("day")
            let newDate = null
            if (event.date) {
                if (this.props.adjustFunction) {
                    dateMoment = dateMoment[this.props.adjustFunction](this.props.adjustParameter)
                }
                newDate = dateMoment.toDate()
            }
            const oldDate = this.getValue()
            this.setState({ value : newDate })
            UX.validateComponent(this)
            if (this.props.onChange) {
                if (!Util.isDatesEqual(newDate, oldDate)) {
                    this.props.onChange(event, newDate, this)
                }
            }
        }.bind(this))
        // It appears datetimepicker consumes focus event preventing blur on VXTextEditor:
        $(`${selector} .datepickerbutton`).on("click", () => {
            $(`#${this.props.id}`).focus()
        })
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        if (UX.isFormReceiveProps(this) && newProps.hasOwnProperty("value")) {
            this.setValue(newProps.value)
        }
    }

    componentWillUnmount() {
        let selector = this.getSelector()
        $(selector).off("dp.change")
        $(selector).data("DateTimePicker")?.destroy()
        UX.unregister(this)
    }

    getValue() {
        if (Util.isNullish(this.state.value)) {
            return null
        }
        return this.state.value
    }

    setValue(value) {
        this.setState({value: value}, () => {
            let selector = this.getSelector()
            let dateString = value ? moment.tz(value, this.timezone).format(this.props.format) : null
            //OLog.debug(`VXDate.jsx setValue componentId=${this.props.id} value=${value} dateString=${dateString}`)
            $(selector).data("DateTimePicker")?.date(dateString)
        })
    }

    getSelector() {
        return "#" + this.props.id + "-picker"
    }

    render() {
        return (
            <div className={`form-group ${this.state.error ? " " + CX.CLASS_HAS_ERROR : ""} ${this.props.groupClass || ""}`}>
                {this.props.label &&
                    <label htmlFor={this.props.id} className="control-label" title={this.props.tooltip}>
                        <div className="top-label-span">
                            {this.props.label}{" "}
                            {this.props.star &&
                                <span className="fa fa-star-o icon-required"></span>
                            }
                        </div>
                        {""}
                    </label>
                }
                <div id={this.props.id + "-picker"} className={`input-group date ${this.props.pickerClassName || ""}`}>
                    <input id={this.props.id} type="text" className="form-control" placeholder={this.props.placeholder}/>
                    {this.props.showButton &&
                        <div className="input-group-btn">
                            <button className="btn btn-default add-on datepickerbutton" type="button">
                                <span className="fa fa-calendar"></span>
                            </button>
                        </div>
                    }
                </div>
            </div>
        )
    }
}
