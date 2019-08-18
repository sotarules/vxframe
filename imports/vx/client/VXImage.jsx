import { Component } from "react"
import PropTypes from "prop-types"

export default class VXImage extends Component {

    static displayName = "VXImage"

    static propTypes = {
        id : PropTypes.string.isRequired,
        size : PropTypes.oneOf(["small", "medium"]).isRequired,
        imageType : PropTypes.string.isRequired,
        value : PropTypes.string,
        required : PropTypes.bool,
        dbName : PropTypes.string
    }

    static defaultProps = {
        size : "medium"
    }

    sizeData = {
        small : {
            styles : {
                thumbnail : { width: "80px", height : "80px" },
                preview : { maxWidth: "80px", maxHeight : "80px", width: "80px", height : "80px" }
            },
            holder : "70x70"
        },
        medium : {
            styles : {
                thumbnail : { width: "110px", height : "110px" },
                preview : { maxWidth: "110px", maxHeight : "110px", width: "110px", height : "110px" }
            },
            holder : "100x100"
        }
    }

    constructor(props) {
        super(props)
        this.state = { value : Util.getNullAsEmpty(props.value) }
        this.originalState = Object.assign({}, this.state)
    }

    reset() {
        this.setState(this.originalState, () => {
            let selector = "#" + this.props.id
            $(selector).fileinput("reset")
        })
    }

    componentDidMount() {
        UX.register(this)
        let selector = "#" + this.props.id
        $(selector).fileinput()
        Holder.run()
        $(selector).on("change.bs.fileinput clear.bs.fileinput", () => {
            let $img = $(selector + " > .fileinput-preview > img")
            let content = $img.exists() ? $img.attr("src") : null
            this.setState( { value: Util.getNullAsEmpty(content) } )
            let form = UX.findForm(this.props.id)
            if (form.props.dynamic) {
                UX.updateImage(this, (error, result) => {
                    UX.notify(result, error, true)
                })
            }
        })
    }

    componentWillUnmount() {
        UX.unregister(this)
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        if (UX.isFormReceiveProps(this) && newProps.hasOwnProperty("value")) {
            //OLog.debug("VXImage.jsx UNSAFE_componentWillReceiveProps componentId=" + this.props.id + " value=" + newProps.value + " *update*")
            this.setValue(newProps.value)
        }
    }

    componentWillUnmount() {
        let selector = "#" + this.props.id
        $(selector).off("change.bs.fileinput clear.bs.fileinput")
    }

    getValue() {
        return this.state.value
    }

    setValue(value) {
        this.setState({value: value})
    }

    render() {
        return (
            <div id={this.props.id} className={this.imagePickerClasses()} data-provides="fileinput">
                <div className="fileinput-new thumbnail" style={this.styles().thumbnail}>
                    <img id="img-holder" data-src={"holder.js/" + this.sizeData[this.props.size].holder} alt="..."/>
                </div>
                <div className="fileinput-preview fileinput-exists thumbnail" style={this.styles().preview}>
                    <img src={this.state.value}/>
                </div>
                <div className="btn-small-icon-container">
                    <span className="btn btn-default btn-file btn-xs btn-small-icon-choose">
                        <span className="fileinput-new fa fa-plus fa-sm"></span>
                        <span className="fileinput-exists fa fa-plus fa-sm"></span>
                        <input type="file"
                            accept="image/*"
                            name="..."
                            data-original-url={this.state.value}/>
                    </span>
                    <a id="button-remove"
                        className="btn btn-default btn-xs btn-small-icon-choose fileinput-exists pull-right"
                        data-dismiss="fileinput"
                        onClick={this.handleClickRemove()}>
                        <span className="fa fa-minus fa-sm"></span>
                    </a>
                </div>
            </div>
        )
    }

    styles() {
        return this.sizeData[this.props.size].styles
    }

    imagePickerClasses() {
        return "fileinput " + (this.state.value ? "fileinput-exists" : "fileinput-new")
    }

    handleClickRemove() {
        UX.fixHolder()
    }
}
