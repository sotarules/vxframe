import {Component} from "react"
import PropTypes from "prop-types"
import VXModal from "/imports/vx/client/VXModal"
import VXForm from "/imports/vx/client/VXForm"
import ModalBody from "/imports/vx/client/ModalBody"
import ModalHeaderImage from "/imports/vx/client/ModalHeaderImage"
import VXSelect from "/imports/vx/client/VXSelect"
import VXInput from "/imports/vx/client/VXInput"
import VXDate from "/imports/vx/client/VXDate"
import VXCheck from "/imports/vx/client/VXCheck"
import ReportTreeModalFooter from "./ReportTreeModalFooter"

export default class ReportTreeModal extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        nodeInfo : PropTypes.object.isRequired,
        report : PropTypes.object.isRequired
    }

    static defaultProps = {
        id : "report-tree-modal"
    }

    render() {
        return (
            <VXModal id={this.props.id}
                width="600px"
                backdrop="true">
                <ModalHeaderImage imageUrl={`${CX.CLOUDFILES_PREFIX}/img/system/reports1.png`}
                    heading={this.title()}
                    subheading={Util.i18n("common.label_field_properties")}/>
                <ModalBody scrollable={false}>
                    <VXForm id={`${this.props.id}-form`}
                        ref={(form) => { this.form = form }}
                        className="flexi-fixed"
                        dynamic={true}
                        elementType="div"
                        updateHandler={this.handleUpdateField.bind(this)}>
                        {this.renderFields()}
                    </VXForm>
                </ModalBody>
                <ReportTreeModalFooter onClickReset={this.handleClickReset.bind(this)}/>
            </VXModal>
        )
    }

    renderFields() {
        const metadataPath = this.props.nodeInfo.value || "ROOT"
        const fieldsObject = this.findFieldsObject(metadataPath)
        if (metadataPath === "ROOT") {
            return this.renderFieldsRoot(fieldsObject)
        }
        return this.renderFieldsStandard(fieldsObject)
    }

    renderFieldsRoot(fieldsObject) {
        return (
            <div className="flexi-fixed">
                <div className="row">
                    <div className="col-sm-3">
                        <VXSelect id={`${this.props.id}-padding`}
                            groupClass="form-group-first"
                            label={Util.i18n("common.label_padding")}
                            codeArray={UX.addBlankSelection(UX.makeCodeArray("reportCellPadding"))}
                            bindingType="String"
                            value={fieldsObject.padding}
                            dbName="padding"/>
                    </div>
                    <div className="col-sm-3">
                        <VXSelect id={`${this.props.id}-limit`}
                            groupClass="form-group-first"
                            label={Util.i18n("common.label_limit")}
                            codeArray={UX.addBlankSelection(UX.makeCodeArray("reportLimit"))}
                            bindingType="Integer"
                            value={fieldsObject.limit}
                            dbName="limit"/>
                    </div>
                    <div className="col-sm-6">
                        <VXSelect id={`${this.props.id}-row-format`}
                            groupClass="form-group-first"
                            label={Util.i18n("common.label_report_row_format")}
                            codeArray={UX.addBlankSelection(UX.makeCodeArray("reportRowFormat"))}
                            bindingType="String"
                            value={fieldsObject.rowFormat}
                            dbName="rowFormat"/>
                    </div>
                </div>
            </div>
        )
    }

    renderFieldsStandard(fieldsObject) {
        const definition = this.findDefinition()
        return (
            <div className="flexi-fixed">
                <div className="row">
                    <div className="col-sm-3">
                        <VXSelect id={`${this.props.id}-alignment`}
                            label={Util.i18n("common.label_alignment")}
                            codeArray={UX.addBlankSelection(UX.makeCodeArray("reportColumnAlignment"))}
                            value={fieldsObject.alignment}
                            dbName="alignment"/>
                    </div>
                    <div className="col-sm-3">
                        <VXSelect id={`${this.props.id}-width`}
                            label={Util.i18n("common.label_width")}
                            codeArray={UX.addBlankSelection(UX.makeCodeArray("reportColumnWidth"))}
                            value={fieldsObject.width}
                            dbName="width"/>
                    </div>
                    <div className="col-sm-3">
                        <VXSelect id={`${this.props.id}-overflow`}
                            label={Util.i18n("common.label_overflow")}
                            codeArray={UX.addBlankSelection(UX.makeCodeArray("reportOverflowRule"))}
                            value={fieldsObject.overflow}
                            dbName="overflow"/>
                    </div>
                    <div className="col-sm-3">
                        <VXSelect id={`${this.props.id}-sort`}
                            label={Util.i18n("common.label_sort")}
                            codeArray={UX.addBlankSelection(UX.makeCodeArray("sortPriority"))}
                            bindingType="Integer"
                            value={fieldsObject.sort}
                            dbName="sort"/>
                    </div>
                </div>
                {this.renderFilterRow(definition, fieldsObject)}
            </div>
        )
    }

    renderFilterRow(definition, fieldsObject) {
        if (definition.list) {
            const codeArray = UX.addBlankSelection(UX.makeCodeArray(definition.list))
            return this.renderFilterRowList(definition, fieldsObject, codeArray)
        }
        if (definition.codeArrayFunction) {
            const codeArray = UX.addBlankSelection(definition.codeArrayFunction())
            return this.renderFilterRowList(definition, fieldsObject, codeArray)
        }
        if (definition.bindingType === "String") {
            return this.renderFilterRowString(definition, fieldsObject)
        }
        if (definition.bindingType === "Integer") {
            return this.renderFilterRowNumber(definition, fieldsObject)
        }
        if (definition.bindingType === "Money") {
            return this.renderFilterRowNumber(definition, fieldsObject)
        }
        if (definition.bindingType === "Date") {
            return this.renderFilterRowDate(definition, fieldsObject)
        }
        if (definition.bindingType === "Boolean") {
            return this.renderFilterRowCheckbox(definition, fieldsObject)
        }
        OLog.error(`ReportTreeNodeComponent.jsx renderFilterRow unrecognized bindingType=${definition.bindingType}`)
    }

    renderFilterRowList(definition, fieldsObject, codeArray) {
        return (
            <div className="row">
                <div className="col-sm-3">
                    <VXSelect id={`${this.props.id}-negation`}
                        label={Util.i18n("common.label_negation")}
                        codeArray={UX.addBlankSelection(UX.makeCodeArray("negationOperator"))}
                        value={fieldsObject.negation}
                        dbName="negation"/>
                </div>
                <div className="col-sm-3">
                    <VXSelect id={`${this.props.id}-operator`}
                        label={Util.i18n("common.label_operator")}
                        codeArray={this.makeOperatorArray(["EQUAL", "EXISTS"])}
                        value={fieldsObject.operator}
                        dbName="operator"/>
                </div>
                {fieldsObject.operator !== "EXISTS" &&
                    <div className="col-sm-6">
                        <VXSelect id={`${this.props.id}-filter`}
                            label={Util.i18n("common.label_filter")}
                            codeArray={codeArray}
                            value={fieldsObject.filter}
                            dbName="filter"/>
                    </div>
                }
            </div>
        )
    }

    renderFilterRowString(definition, fieldsObject) {
        return (
            <div className="row">
                <div className="col-sm-3">
                    <VXSelect id={`${this.props.id}-negation`}
                        label={Util.i18n("common.label_negation")}
                        codeArray={UX.addBlankSelection(UX.makeCodeArray("negationOperator"))}
                        value={fieldsObject.negation}
                        dbName="negation"/>
                </div>
                <div className="col-sm-3">
                    <VXSelect id={`${this.props.id}-operator`}
                        label={Util.i18n("common.label_operator")}
                        codeArray={this.makeOperatorArray()}
                        value={fieldsObject.operator}
                        dbName="operator"/>
                </div>
                {fieldsObject.operator !== "EXISTS" &&
                    <div className="col-sm-6">
                        <VXInput id={`${this.props.id}-filter`}
                            label={Util.i18n("common.label_filter")}
                            value={fieldsObject.filter}
                            dbName="filter"/>
                    </div>
                }
            </div>
        )
    }

    renderFilterRowNumber(definition, fieldsObject) {
        return (
            <div className="row">
                <div className="col-sm-3">
                    <VXSelect id={`${this.props.id}-negation`}
                        label={Util.i18n("common.label_negation")}
                        codeArray={UX.addBlankSelection(UX.makeCodeArray("negationOperator"))}
                        value={fieldsObject.negation}
                        dbName="negation"/>
                </div>
                <div className="col-sm-3">
                    <VXSelect id={`${this.props.id}-operator`}
                        label={Util.i18n("common.label_operator")}
                        codeArray={this.makeOperatorArray(["EQUAL", "GREATER_THAN", "LESS_THAN", "EXISTS"])}
                        value={fieldsObject.operator}
                        dbName="operator"/>
                </div>
                {fieldsObject.operator !== "EXISTS" &&
                    <div className="col-sm-6">
                        <VXInput id={`${this.props.id}-filter`}
                            label={Util.i18n("common.label_filter")}
                            rule={definition.rule}
                            bindingType={definition.bindingType}
                            format={definition.format}
                            value={fieldsObject.filter}
                            dbName="filter"/>
                    </div>
                }
            </div>
        )
    }

    renderFilterRowDate(definition, fieldsObject) {
        return (
            <div className="row">
                <div className="col-sm-3">
                    <VXSelect id={`${this.props.id}-negation`}
                        label={Util.i18n("common.label_negation")}
                        codeArray={UX.addBlankSelection(UX.makeCodeArray("negationOperator"))}
                        value={fieldsObject.negation}
                        dbName="negation"/>
                </div>
                <div className="col-sm-3">
                    <VXSelect id={`${this.props.id}-operator`}
                        label={Util.i18n("common.label_operator")}
                        codeArray={this.makeOperatorArray(["EQUAL", "GREATER_THAN", "LESS_THAN", "EXISTS"])}
                        value={fieldsObject.operator}
                        dbName="operator"/>
                </div>
                {fieldsObject.operator !== "EXISTS" &&
                    <div className="col-sm-6">
                        <VXDate id={`${this.props.id}-filter`}
                            label={Util.i18n("common.label_filter")}
                            format="M/D/YYYY"
                            startOfDay={true}
                            dbName="filter"
                            value={fieldsObject.filter}/>
                    </div>
                }
            </div>
        )
    }

    renderFilterRowCheckbox(definition, fieldsObject) {
        return (
            <div className="row">
                <div className="col-sm-3">
                    <VXSelect id={`${this.props.id}-negation`}
                        label={Util.i18n("common.label_negation")}
                        codeArray={UX.addBlankSelection(UX.makeCodeArray("negationOperator"))}
                        value={fieldsObject.negation}
                        dbName="negation"/>
                </div>
                <div className="col-sm-3">
                    <VXSelect id={`${this.props.id}-operator`}
                        label={Util.i18n("common.label_operator")}
                        codeArray={this.makeOperatorArray(["EQUAL", "EXISTS"])}
                        value={fieldsObject.operator}
                        dbName="operator"/>
                </div>
                {fieldsObject.operator !== "EXISTS" &&
                    <div className="col-sm-6">
                        <VXCheck id={`${this.props.id}-filter`}
                            labelClass="form-group"
                            className="checkbox-vertical-middle"
                            label={Util.i18n("common.label_filter")}
                            checked={fieldsObject.filter}
                            dbName="filter"/>
                    </div>
                }
            </div>
        )
    }

    title() {
        if (!this.props.nodeInfo.value) {
            return Util.getCodeLocalized("entityType", this.props.report.entityType)
        }
        const definition = this.findDefinition()
        return Util.i18nLocalize(definition.localized)
    }

    findDefinition() {
        return VXApp.findDefinition(Meta[this.props.report.entityType], this.props.nodeInfo.value)
    }

    findFieldsObject(metadataPath) {
        const fields = this.props.report.fields
        return _.findWhere(fields, {metadataPath}) || {}
    }

    makeOperatorArray(desiredOperators) {
        const codeArray = UX.makeCodeArray("logicalOperator")
        if (!desiredOperators) {
            return UX.addBlankSelection(codeArray)
        }
        return UX.addBlankSelection(codeArray.filter(codeObject => {
            return desiredOperators.includes(codeObject.code)
        }))
    }

    handleUpdateField(component, value) {
        VXApp.updateTreeNodeField(Reports, this.props.report, "fields",
            this.props.nodeInfo.value, component, value)
    }

    handleClickReset() {
        VXApp.updateTreeNodeFieldsReset(Reports, this.props.report, "fields",
            this.props.nodeInfo.value)
        UX.clearForm(this.form)
    }
}
