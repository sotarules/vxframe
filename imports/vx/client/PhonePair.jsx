import { Component } from "react"
import PropTypes from "prop-types"
import {get} from "lodash"
import VXSelect from "/imports/vx/client/VXSelect"
import VXInput from "/imports/vx/client/VXInput"
import VXFieldBox from "/imports/vx/client/VXFieldBox"

export default class PhonePair extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        className : PropTypes.string,
        editable : PropTypes.bool.isRequired,
        collection : PropTypes.object.isRequired,
        record : PropTypes.object.isRequired,
        getRowsPath : PropTypes.func.isRequired
    }

    static defaultProps = {
        editable : false
    }

    constructor(props) {
        super(props)
        const phoneArray = this.phoneArray()
        const type = phoneArray.length > 0 ? phoneArray[0].type : "MAIN"
        this.state = { type }
    }

    render() {
        const phoneArray = this.phoneArray()
        const phoneObject = _.findWhere(phoneArray, { type: this.state.type }) || { type: "MAIN" }
        return (
            <>
               <div className="col-sm-3">
                   <VXSelect id={`${this.props.id}-type`}
                       codeArray={UX.makeCodeArray("phoneType")}
                       label={Util.i18n("common.label_phone_type")}
                       tooltip={this.tooltip()}
                       value={this.state.type}
                       dbName="type"
                       updateHandler={() => false}
                       onChange={this.handleChangeType.bind(this)}/>
               </div>
                <div className="col-sm-3">
                    {this.props.editable ? (
                        <VXInput id={`${this.props.id}-number`}
                            label={Util.getCodeLocalized("phoneType", this.state.type)}
                            tooltip={this.tooltip()}
                            value={phoneObject.number}
                            rule={VX.common.phone}
                            supplementalValues={["US"]}
                            format={FX.phoneUS}
                            dbName="number"
                            updateHandler={this.handleUpdateNumber.bind(this)}/>
                    ) : (
                        <VXFieldBox label={Util.getCodeLocalized("phoneType", this.state.type)}
                            tooltip={this.tooltip()}
                            value={FX.phoneUS.render(phoneObject.number, "US")}
                            linkType="phone"/>
                    )}
                </div>
            </>
        )
    }

    tooltip() {
        const phoneArray = this.phoneArray()
        const tooltipArray = phoneArray.map(phoneObject => {
            return Util.i18n("common.tooltip_phone_pair",
                { type: Util.localizeCode("phoneType", phoneObject.type),
                    number: FX.phoneUS.render(phoneObject.number, "US") } )
        })
        return tooltipArray.join("\n")
    }

    handleChangeType(event) {
        this.setState({type: event.target.value })
    }

    handleUpdateNumber(component) {
        const phoneArray = this.phoneArray()
        const number = component.getValue()
        const oldPhoneObject = _.findWhere(phoneArray, { type: this.state.type })
        if (oldPhoneObject) {
            if (Util.isNullish(number)) {
                const index = _.indexOf(_.pluck(phoneArray, "type"), this.state.type)
                phoneArray.splice(index, 1)
            }
            else {
                oldPhoneObject.number = number
            }
        }
        else {
            const newPhoneObject = {}
            newPhoneObject.type = this.state.type
            newPhoneObject.number = number
            phoneArray.push(newPhoneObject)
        }
        this.performUpdate(component, phoneArray)
    }

    phoneArray() {
        const rowsPath = this.props.getRowsPath()
        return get(this.props.record, rowsPath) || []
    }

    performUpdate(component, phoneArray) {
        const rowsPath = this.props.getRowsPath()
        const mongoPath = Util.toMongoPath(rowsPath)
        const modifier = {}
        modifier.$set = {}
        modifier.$set[mongoPath] = phoneArray
        OLog.debug(`PhonePair.jsx performUpdate collection=${this.props.collection._name} recordId=${this.props.record._id} ` +
            `componentId=${component.props.id} rowsPath=${rowsPath} modifier=${OLog.debugString(modifier)}`)
        this.props.collection.update(this.props.record._id, modifier)
        OLog.debug(`PhonePair.jsx performUpdate recordId=${this.props.record._id} *success*`)
    }
}
