import { Component } from "react"
import PropTypes from "prop-types"
import RadioButtonGroup from "/imports/vx/client/RadioButtonGroup"
import RadioButton from "/imports/vx/client/RadioButton"
import BottomButton from "/imports/vx/client/BottomButton"
import FunctionEntityList from "/imports/vx/client/FunctionEntityList"
import { setPublishAuthoringFunction } from "/imports/vx/client/code/actions"

export default class FunctionViewLeft extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        functions : PropTypes.array.isRequired
    }

    static defaultProps = {
        id : "function-view-left"
    }

    constructor(props) {
        super(props)
        this.locked = false
    }

    shouldComponentUpdate() {
        return !this.locked
    }

    setLocked(locked) {
        this.locked = locked
    }

    render() {
        return (
            <div id={this.props.id}
                className="left-list-container flexi-grow">
                <RadioButtonGroup id="button-group-functions"
                    value="FUNCTIONS">
                    <RadioButton id="button-functions"
                        text={Util.i18n("common.label_functions")}
                        value="FUNCTIONS"/>
                </RadioButtonGroup>
                <FunctionEntityList id="function-view-left-list"
                    functions={this.props.functions}
                    selectable={true}
                    chevrons={true}
                    onSelect={this.handleSelectEntity.bind(this)}/>
                <BottomButton id="button-create-template"
                    className="btn-primary"
                    text={Util.i18n("common.button_create_function")}
                    onClick={this.handleClickCreate.bind(this)}/>
            </div>
        )
    }

    handleSelectEntity(event, component) {
        const publishAuthoringFunction = {}
        publishAuthoringFunction.criteria = { _id : component.props.itemId }
        Store.dispatch(setPublishAuthoringFunction(publishAuthoringFunction))
        if (UX.isSlideMode()) {
            UX.iosMinorPush("common.button_functions", "RIGHT")
        }
    }

    handleClickCreate(callback) {
        callback()
        UX.setLocked(["function-view-left", "function-view-right"], true)
        Functions.insert({ }, (error, functionId) => {
            if (error) {
                OLog.error(`FunctionViewLeft.jsx error attempting to create template=${error}`)
                UX.notifyForDatabaseError(error)
                return
            }
            const publishAuthoringFunction = {}
            publishAuthoringFunction.criteria = { _id : functionId }
            Store.dispatch(setPublishAuthoringFunction(publishAuthoringFunction))
            if (UX.isSlideMode()) {
                UX.iosMajorPush("common.button_functions", "common.button_functions", `/function/${functionId}`, "RIGHT")
            }
            else {
                UX.iosMajorPush(null, null, `/function/${functionId}`, "RIGHT", "crossfade")
            }
        })
    }
}
