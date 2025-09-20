import xlsx from "node-xlsx"

RecordImporter = {

    findImportRequests() {
        try {
            const selector = {}
            selector.status = "WAITING"
            UploadStats.find(selector).forEach(uploadStats => {
                if (uploadStats.status !== "WAITING") {
                    OLog.debug("recordimporter.js findImportRequests no longer waiting *bypass* " +
                        `domainId=${uploadStats.domain} uploadType=${uploadStats.uploadType} ` +
                        `requestor=${Util.getUserEmail(uploadStats.userId)}`)
                    return
                }
                const selector = {}
                selector._id = uploadStats._id
                selector.date = uploadStats.date
                const modifier = {}
                modifier.$set = {}
                modifier.$set.status = "ACTIVE"
                modifier.$set.processed = 0
                const count = UploadStats.update(selector, modifier)
                if (count !== 1) {
                    OLog.debug("recordimporter.js findImportRequests unable to acquire *bypass* " +
                    `domainId=${uploadStats.domain} uploadType=${uploadStats.uploadType} ` +
                        `requestor=${Util.getUserEmail(uploadStats.userId)}`)
                    return
                }
                OLog.debug("recordimporter.js findImportRequests upload request *active* " +
                    `domainId=${uploadStats.domain} uploadType=${uploadStats.uploadType} ` +
                    `requestor=${Util.getUserEmail(uploadStats.userId)}`)
                Meteor.setTimeout(async() => {
                    const result = await RecordImporter.importFile(uploadStats)
                    const modifier = {}
                    modifier.$set = {}
                    if (result.success) {
                        if (!result.errors) {
                            modifier.$set.status = "COMPLETED"
                        }
                        else {
                            modifier.$set.status = "COMPLETED_WITH_ERRORS"
                        }
                    }
                    else if (result.stopped) {
                        modifier.$set.status = "STOPPED"
                    }
                    else {
                        modifier.$set.status = "FAILED"
                    }
                    OLog.debug(`recordimporter.js findImportRequests *finished* result=${OLog.debugString(result)} ` +
                        `domainId=${uploadStats.domain} uploadType=${uploadStats.uploadType} ` +
                        `uploadStats.uploadParameters=${OLog.debugString(uploadStats.uploadParameters)} ` +
                        `requestor=${Util.getUserEmail(uploadStats.userId)} modifier=${OLog.debugString(modifier)}`)
                    UploadStats.update(uploadStats._id, modifier)
                    RecordImporter.createNotificationForResult(result, uploadStats.domain, uploadStats.userId)
                })
            })
        }
        catch (error) {
            OLog.error(`recordimporter.js findImportRequests unexpected error=${OLog.errorError(error)}`)
            return
        }
    },

    /**
     * Locate and reset any import requests of the specified type in progress.
     */
    resetPendingImportRequests() {
        const selector = {}
        selector.status = {}
        selector.$in = ["ACTIVE", "TRANSMITTING", "WAITING", "PROCESSING", "UPDATING"]
        UploadStats.find(selector).forEach(uploadStats => {
            OLog.debug(`recordimporter.js resetPendingImportRequests *found* domainId=${uploadStats.domain} ` +
                `uploadType=${uploadStats.uploadType} requestor=${Util.getUserEmail(uploadStats.userId)}`)
            VXApp.setUploadStatus(uploadStats.uploadType, "CLEARED", uploadStats.domain)
            RecordImporter.createImportEvent("IMPORT_RESET", uploadStats.uploadType, uploadStats.domain)
        })
    },

    /**
     * Import a spreadsheet file.
     *
     * @param {object} uploadStats Upload stats object.
     * @return {object} Result object.
     */
    importFile(uploadStats) {
        try {
            if (!_.isObject(uploadStats)) {
                OLog.error(`recordimporter.js importFile parameter check failed uploadStats=${uploadStats}`)
                return { success: false, icon: "EYE", key: "common.alert_parameter_check_failed" }
            }
            const messages = []
            OLog.debug("recordimporter.js importFile importing " +
             `domainId=${uploadStats.domain} uploadType=${uploadStats.uploadType} ` +
             `uploadStats.uploadParameters=${OLog.debugString(uploadStats.uploadParameters)} ` +
             `filePath=${uploadStats.filePath}`)
            const result = RecordImporter.importFileProcess(uploadStats, messages)
            if (result.stopped) {
                return result
            }
            if (!result.success) {
                RecordImporter.createImportEvent("IMPORT_FAIL", uploadStats.uploadType, uploadStats.domain)
                return result
            }
            OLog.debug(`recordimporter.js importFile domainId=${uploadStats.domain} ` +
                `uploadType=${uploadStats.uploadType} messages length=${messages.length}`)
            RecordImporter.createImportEvent("IMPORT_FINISH", uploadStats.uploadType, uploadStats.domain)
            if (messages.length !== 0) {
                const modifier = {}
                modifier.$set = {}
                modifier.$set.messages = messages
                UploadStats.update(uploadStats._id, modifier)
                OLog.debug(`recordimporter.js importFile domainId=${uploadStats.domain} ` +
                    `uploadType=${uploadStats.uploadType} messages length=${messages.length} ` +
                    "*stored* in UploadStats collection")
                return { success: true, icon: "UPLOAD", type: "NOTICE", key: "common.alert_upload_errors_detected", errors: true }
            }
            return { success: true, icon: "UPLOAD", type: "INFO", key: "common.alert_upload_success" }
        }
        catch (error) {
            OLog.error(`recordimporter.js importFile unexpected error=${OLog.errorError(error)}`)
            return { success: false, icon: "BUG", key: "common.alert_unexpected_error",
                variables: { error: error.toString() }
            }
        }
    },

    /**
     * Perfrom the actual process of importing a spreadsheet.
     *
     * @param {object} uploadStatus Upload status record.
     * @param {messages} array Arrray of messages to mutate.
     * @return {object} Standard result object.
     */
    importFileProcess(uploadStats, messages) {
        OLog.debug(`recordimporter.js importFileProcess domainId=${uploadStats.domain} ` +
            `uploadType=${uploadStats.uploadType} userId=${uploadStats.userId} filePath=${uploadStats.filePath} ` +
            `totalSize=${uploadStats.totalSize} *init*`)
        const rowArray = RecordImporter.makeRowArray(uploadStats)
        if (rowArray.length < 1) {
            OLog.debug("recordimporter.js importFileProcess *abort* spreadsheet has no rows")
            return { success: true }
        }
        OLog.debug(`recordimporter.js importFileProcess domainId=${uploadStats.domain} ` +
            `uploadType=${uploadStats.uploadType} userId=${uploadStats.userId} filePath=${uploadStats.filePath} ` +
            `totalSize=${uploadStats.totalSize} *complete*`)
        const modifier = {}
        modifier.$set = {}
        modifier.$set.filePath = uploadStats.filePath
        modifier.$set.totalSize = uploadStats.totalSize
        modifier.$set.processed = 0
        modifier.$set.total = rowArray.length
        modifier.$set.status = "PROCESSING"
        UploadStats.update(uploadStats._id, modifier)
        const metadataRoot = Meta[uploadStats.uploadType]
        const uploadTypeObject = Util.getCodeObject("uploadType", uploadStats.uploadType)
        const headerArray = rowArray[0].row
        const headerCellsValid = RecordImporter.validateHeaderCells(metadataRoot, headerArray, messages)
        if (!headerCellsValid) {
            OLog.debug("recordimporter.js importFileProcess *abort* header has invalid path one or more invalid paths")
            return { success: true }
        }
        const metadataPaths = RecordImporter.makeMetadataPaths(metadataRoot, headerArray)
        OLog.debug(`recordimporter.js importFileProcess *header* row count=${rowArray.length} ` +
            `metadataPaths=${OLog.debugString(metadataPaths)}`)
        const headerCellsRecordKeyPresent = RecordImporter.validateHeaderCellsRecordKeyPresent(uploadStats, uploadTypeObject,
            metadataRoot, metadataPaths, messages)
        if (!headerCellsRecordKeyPresent) {
            OLog.debug("recordimporter.js importFileProcess *abort* header did not supply record key field")
            return { success: true }
        }
        const headerCellsKeysPresent = RecordImporter.validateHeaderCellsKeysPresent(metadataRoot, metadataPaths, messages)
        if (!headerCellsKeysPresent) {
            OLog.debug("recordimporter.js importFileProcess *abort* header doesn't supply all necessary key columns")
            return { success: true }
        }
        const insertArray = []
        const superCache = {}
        let processed = 1
        for (let rowIndex = 1; rowIndex < rowArray.length; rowIndex++) {
            const result = RecordImporter.importFileCheckStop(uploadStats)
            if (!result.success) {
                return result
            }
            const rowObject = rowArray[rowIndex]
            RecordImporter.processRow(uploadStats, uploadTypeObject, metadataPaths,
                rowObject, messages, insertArray, superCache)
            processed++
            UploadStats.update(uploadStats._id, { $set: { processed } })
        }
        OLog.debug(`recordimporter.js importFileProcess domainId=${uploadStats.domain} ` +
            `uploadType=${uploadStats.uploadType} userId=${uploadStats.userId} ` +
            `*persisting* records=${insertArray.length}`)
        const coll = Util.getCollection(uploadTypeObject.collection)
        RecordImporter.performSimpleUpsert(uploadStats, metadataRoot, coll, insertArray)
        return { success: true }
    },

    /**
     * Transform a row from the spreadsheet into an object in the insertArray suitable upsert.
     *
     * @param {object} uploadStats Upload stats object.
     * @param {object} uploadTypeObject Upload type object from codes.
     * @param {array} metadataPaths Array of column headers (top row).
     * @param {object} rowObject Row object being processed.
     * @param {array} messages Array of validation messages (mutated in place).
     * @param {array} insertArray Array of records to be inserted (mutated in place).
     * @param {object} superCache Cache to improve lookup performance.
     */
    processRow(uploadStats, uploadTypeObject, metadataPaths,
        rowObject, messages, insertArray, superCache) {
        const metadataRoot = Meta[uploadStats.uploadType]
        const recordKeyPresent = RecordImporter.validateDataCellsRecordKeyPresent(uploadStats, uploadTypeObject,
            metadataRoot, metadataPaths, uploadTypeObject.keypath, rowObject, messages, superCache)
        if (!recordKeyPresent) {
            OLog.debug("recordimporter.js processRow *bypass* row does not specify record key " +
                `rowObject=${OLog.debugString(rowObject)}`)
            return
        }
        const keypathIndex = metadataPaths.indexOf(uploadTypeObject.keypath)
        const key = FX.trim.strip(rowObject.row[keypathIndex])
        let results = RecordImporter.findResultsByKey(insertArray, uploadTypeObject.keypath, key)
        if (!results) {
            results = {}
            results.selector = {}
            results.selector.domain = uploadStats.domain
            if (uploadTypeObject.retiredDatePath) {
                results.selector[uploadTypeObject.retiredDatePath] = { $exists: false }
            }
            results.selector[uploadTypeObject.keypath] = RecordImporter.currentCellValue(key)
            const coll = Util.getCollection(uploadTypeObject.collection)
            results.record  = coll.findOne(results.selector)
            if (RecordImporter.isKeyUpdate(key) && !results.record) {
                OLog.warn(`recordimporter.js processRow key=${key} original record not found - looking up by proposed key ` +
                    `rowObject=${OLog.warnString(rowObject)}`)
                results.selector[uploadTypeObject.keypath] = RecordImporter.proposedCellValue(key)
                results.record = coll.findOne(results.selector)
            }
            if (!results.record) {
                results.record = {}
                results.record.domain = uploadStats.domain
                results.record[uploadTypeObject.keypath] = RecordImporter.proposedCellValue(key)
                RecordImporter.applyHooks(uploadStats, metadataRoot, null, results.record,
                    results.record, "onCreate")
            }
            else {
                results.record[uploadTypeObject.keypath] = RecordImporter.proposedCellValue(key)
                RecordImporter.applyHooks(uploadStats, metadataRoot, null, results.record,
                    results.record, "onModify")
            }
            insertArray.push(results)
        }
        RecordImporter.prepareRow(uploadStats, metadataRoot, metadataPaths, rowObject,
            messages, results.record, insertArray, superCache)
        return
    },

    /**
     * Process the entire row copying cells into the supplied record.
     *
     * @param {object} uploadStats Upload stats object.
     * @param {object} metadataRoot Metadata root object.
     * @param {array} metadataPaths Array of column headers (top row).
     * @param {object} rowObject Row object being processed.
     * @param {array} messages Array of validation messages (mutated in place).
     * @param {object} record Record being created or updated.
     * @param {array} insertArray Array of records to be inserted (mutated in place).
     * @param {object} superCache Cache to improve lookup performance.
     */
    prepareRow(uploadStats, metadataRoot, metadataPaths, rowObject,
        messages, record, insertArray, superCache) {
        const pathIndices = []
        metadataPaths.forEach((metadataPath, columnIndex) => {
            RecordImporter.mutatePathIndices(uploadStats, metadataRoot, metadataPath, columnIndex,
                rowObject, messages, superCache, pathIndices)
            const cell = rowObject.row[columnIndex]
            if (Util.isNullish(cell)) {
                return
            }
            const proposedCellValue = RecordImporter.proposedCellValue(cell)
            const validationResults =
                RecordImporter.validateAndTransform(uploadStats, metadataRoot, metadataPath, rowObject,
                    proposedCellValue, messages, superCache)
            if (!validationResults.valid) {
                return
            }
            const validKeys = RecordImporter.validateDataCellsKeysPresent(metadataRoot, metadataPath,
                rowObject, messages, pathIndices)
            if (!validKeys) {
                return
            }
            const targetObject = RecordImporter.findOrCreateTargetObject(uploadStats, metadataRoot, metadataPath,
                record, pathIndices)
            if (!targetObject) {
                return
            }
            const definition = VXApp.findDefinition(metadataRoot, metadataPath)
            const convertedValue = RecordImporter.convertValue(uploadStats, definition, validationResults.value)
            const propertyName = Util.lastToken(metadataPath, ".")
            targetObject[propertyName] = convertedValue
        })
    },

    /**
     * Mutate a supplied path indices array to add key values.
     *
     * @param {object} uploadStats Upload stats object.
     * @param {object} metadataRoot Metadata root object.
     * @param {string} metadataPath Metadata path of potential key.
     * @param {number} columnIndex Column index of cell.
     * @param {object} rowObject Row object being processed.
     * @param {array} messages Array of validation messages (mutated in place).
     * @param {object} superCache Cache to improve lookup performance.
     * @param {array} pathIndices Path indices array.
     */
    mutatePathIndices(uploadStats, metadataRoot, metadataPath, columnIndex, rowObject, messages, superCache, pathIndices) {
        if (!metadataPath.includes(".")) {
            return
        }
        const definition = VXApp.findDefinition(metadataRoot, metadataPath)
        if (!definition.key) {
            return
        }
        const cell = rowObject.row[columnIndex]
        const input = RecordImporter.currentCellValue(cell)
        const validationResults =
            RecordImporter.validateAndTransform(uploadStats, metadataRoot, metadataPath, rowObject,
                input, messages, superCache)
        const metadataPathParent = Util.tokens(metadataPath, ".", -1)
        const key = Util.lastToken(metadataPath, ".", -1)
        let pathIndicesObject = _.findWhere(pathIndices, { metadataPath: metadataPathParent })
        if (!pathIndicesObject) {
            pathIndicesObject = {}
            pathIndicesObject.metadataPath = metadataPathParent
            pathIndicesObject.keys = {}
            pathIndicesObject.keysPostUpdate = {}
            pathIndices.push(pathIndicesObject)
        }
        pathIndicesObject.keys[key] = validationResults.value
        pathIndicesObject.keysPostUpdate[key] = validationResults.value
        if (RecordImporter.isKeyUpdate(cell)) {
            const inputPostUpdate = RecordImporter.proposedCellValue(cell)
            const validationResultsPostUpdate =
                RecordImporter.validateAndTransform(uploadStats, metadataRoot, metadataPath, rowObject,
                    inputPostUpdate, messages, superCache)
            pathIndicesObject.keysPostUpdate[key] = validationResultsPostUpdate.value
            pathIndicesObject.isKeyUpdate = true
            OLog.warn(`recordimporter.js mutatePathIndices key update scenario detected cell=${cell}`)
        }
    },

    /**
     * Given an insert array and a key, find the matching result.
     *
     * @param {array} insertArray Insert array.
     * @param {string} keypath Key path.
     * @param {string} key Record key field (not database ID).
     * @return {object} Matching result.
     */
    findResultsByKey(insertArray, keypath, key) {
        return _.find(insertArray, results => {
            return results.record[keypath] === key
        })
    },

    /**
     * Validate each of the header cells to determine whether they match metadata.
     *
     * @param {object} metadataRoot Metadata root.
     * @param {array} headerArray Array of columns of first row.
     * @param {array} messages Array of messages.
     * @return {boolean} True if all cells are valid.
     */
    validateHeaderCells(metadataRoot, headerArray, messages) {
        let valid = true
        headerArray.forEach(header => {
            if (!header) {
                return
            }
            const metadataPath = RecordImporter.metadataPathFromHeader(metadataRoot, header)
            if (!metadataPath) {
                valid = false
                const message = {}
                message.index = 0
                message.fieldIdKey = "common.header_cell"
                message.fieldIdVariables = { header }
                message.result = { success : false, icon : "TRIANGLE", key : "common.invalid_header" }
                messages.push(message)
            }
        })
        return valid
    },

    /**
     * Given a list of metadata paths, confirm that the record key is specified.
     *
     * @param {object} uploadStats Upload stats object.
     * @param {object} uploadTypeObject Upload type object.
     * @param {object} metadataRoot Metadata root object.
     * @param {array} metadataPaths Array of column headers (top row).
     * @param {array} messages Array of validation messages (mutated in place).
     * @return {boolean} True if all cells are valid.
     */
    validateHeaderCellsRecordKeyPresent(uploadStats, uploadTypeObject, metadataRoot, metadataPaths,
        messages) {
        const keypathIndex = metadataPaths.indexOf(uploadTypeObject.keypath)
        let valid = true
        if (keypathIndex < 0) {
            const header = VXApp.formatPropertyName(metadataRoot, uploadTypeObject.keypath)
            const recordKey = VXApp.formatPropertyName(metadataRoot, uploadTypeObject.keypath)
            valid = false
            const message = {}
            message.index = 0
            message.fieldIdKey = "common.header_cell"
            message.fieldIdVariables = { header }
            message.result = { success : false, icon : "TRIANGLE", key : "common.invalid_header_record_key_missing",
                variables: { recordKey } }
            messages.push(message)
        }
        return valid
    },

    /**
     * Given a list of metadata paths, confirm that all necessary keys columns are defined.
     *
     * @param {object} metadataRoot Metadata root object.
     * @param {array} metadataPaths Array of column headers (top row).
     * @param {array} messages Array of validation messages (mutated in place).
     * @return {boolean} True if all cells are valid.
     */
    validateHeaderCellsKeysPresent(metadataRoot, metadataPaths, messages) {
        const keyMetadataPaths = RecordImporter.keyMetadataPaths(metadataRoot, metadataPaths)
        const missingKeyPaths = []
        let valid = true
        keyMetadataPaths.forEach(keyMetadataPath => {
            if (!metadataPaths.includes(keyMetadataPath)) {
                missingKeyPaths.push(keyMetadataPath)
            }
        })
        missingKeyPaths.forEach(missingKeyPath => {
            const metadataPathParent = Util.tokens(missingKeyPath, ".", -1)
            const header = VXApp.formatPropertyName(metadataRoot, metadataPathParent)
            const keyField = VXApp.formatPropertyName(metadataRoot, missingKeyPath)
            valid = false
            const message = {}
            message.index = 0
            message.fieldIdKey = "common.header_cell"
            message.fieldIdVariables = { header }
            message.result = { success : false, icon : "TRIANGLE", key : "common.invalid_header_key_missing", variables: { keyField } }
            messages.push(message)
        })
        return valid
    },

    /**
     * Given a list of metadata paths, return a list of all key metadata paths
     * needed to process that input.
     *
     * @param {object} metadataRoot Metadata root object.
     * @param {array} metadataPaths Array of column headers (top row).
     * @return {array} Array of necessary metadata paths.
     */
    keyMetadataPaths(metadataRoot, metadataPaths) {
        const arrayPaths = []
        const keyMetadataPaths = []
        metadataPaths.forEach(metadataPath => {
            let metadataPathParent = metadataPath
            while (metadataPathParent.includes(".")) {
                metadataPathParent = Util.tokens(metadataPathParent, ".", -1)
                const parentDefinition = VXApp.findDefinition(metadataRoot, metadataPathParent)
                if (parentDefinition.bindingType === "Array") {
                    if (!arrayPaths.includes(metadataPathParent)) {
                        Object.keys(parentDefinition.definition).forEach(key => {
                            const childDefinition = parentDefinition.definition[key]
                            if (childDefinition.key) {
                                const metadataPathKey = `${metadataPathParent}.${key}`
                                if (!keyMetadataPaths.includes(metadataPathKey)) {
                                    keyMetadataPaths.push(metadataPathKey)
                                }
                            }
                        })
                        arrayPaths.push(metadataPathParent)
                    }
                }
            }
        })
        OLog.debug(`recordimporter.js keyMetadataPaths metadataPaths=${OLog.debugString(metadataPaths)}`)
        OLog.debug(`recordimporter.js keyMetadataPaths arrayPaths=${OLog.debugString(arrayPaths)} ` +
            `keyMetadataPaths=${OLog.debugString(keyMetadataPaths)}`)
        return keyMetadataPaths
    },

    /**
     * Given an array of valid header cells, return an array of metadata paths.
     *
     * @param {object} metadataRoot Metadata root.
     * @param {array} headerArray Array of columns of first row.
     * @return {array} Array of metadata  paths.
     */
    makeMetadataPaths(metadataRoot, headerArray) {
        const metadataPaths = []
        headerArray.forEach(header => {
            const metadataPath = RecordImporter.metadataPathFromHeader(metadataRoot, header)
            metadataPaths.push(metadataPath)
        })
        return metadataPaths
    },

    /**
     * Given a metadata node root and a header cell, return the corresponding
     * metadata path. This is done by tokenizing the head cell and finding the
     * metadata path equivalent via a partial, case-insensitive lookup.
     *
     * @param {object} metadataNode Metadata node (root).
     * @param {string} header Header cell.
     * @return {string} Metadata path.
     */
    metadataPathFromHeader(metadataNode, header) {
        const headerSegments = header.split(",")
        const metadataSegments = []
        let parentMetadataNode = metadataNode
        for (let headerSegmentIndex = 0; headerSegmentIndex < headerSegments.length; headerSegmentIndex++) {
            const result = RecordImporter.findMetadataNodeChild(parentMetadataNode, headerSegments[headerSegmentIndex])
            if (!result) {
                OLog.error(`recordimporter.js metadataPathFromHeader cannot find metadata definition matching header=[${header}]`)
                return
            }
            metadataSegments.push(result.key)
            parentMetadataNode = result.metadataNode.definition
        }
        return metadataSegments.join(".")
    },

    /**
     * Given a parent node and a user-friendly header segment, find the matching
     * metadata node using a partial match on localized name. Return a result object
     * consisting of the matching key and metadata node.
     *
     * @param {object} parentMetadataNode Metadata node parent.
     * @param {string} headerSegment Header segment.
     * @return {object} Result object.
     */
    findMetadataNodeChild(parentMetadataNode, headerSegment) {
        const tokenNameUpper = headerSegment.trim().toUpperCase()
        const keys = Object.keys(parentMetadataNode)
        for (let index = 0; index < keys.length; index++) {
            const key = keys[index]
            const metadataNode = parentMetadataNode[key]
            const localizationUpper = Util.i18nLocalize(metadataNode.localized).toUpperCase()
            if (localizationUpper.includes(tokenNameUpper)) {
                return { key, metadataNode }
            }
        }
    },

    /**
     * Read the Excel file and transform the workbook into a standard row array.
     *
     * @param {object} uploadStats upload stats record.
     * @return {array} Row array in standard format.
     */
    makeRowArray(uploadStats) {
        try {
            OLog.debug(`recordimporter.js makeRowArray workbook filePath=${uploadStats.filePath} *init*`)
            const worksheets = xlsx.parse(uploadStats.filePath)
            const worksheet = worksheets[0]
            const rowArray = []
            for (let rowIndex = 0; rowIndex < worksheet.data.length; rowIndex++) {
                const index = rowIndex + 1
                const worksheetRow = worksheet.data[rowIndex]
                const row = []
                for (let columnIndex = 0; columnIndex < worksheetRow.length; columnIndex++) {
                    const value = worksheetRow[columnIndex]
                    const stringValue = value ? value.toString() : null
                    row.push(stringValue)
                }
                rowArray.push({index, rowIndex, row})
            }
            OLog.debug(`recordimporter.js makeRowArray workbook filePath=${uploadStats.filePath} *complete* ` +
                `rowArray.length=${rowArray.length}`)
            return rowArray
        }
        catch (error) {
            OLog.error(`recordimporter.js makeRowArray unexpected error=${OLog.errorError(error)}`)
            throw new Error("Unexpected error reading Excel file")
        }
    },

    /**
     * Check for stop request from user; if detected, emit IMPORT_STOP.
     *
     * @param {object} uploadStats Upload stats object.
     * @return {object} Result object.
     */
    importFileCheckStop(uploadStats) {
        try {
            // Refresh uploadStats to get the latest news:
            uploadStats = UploadStats.findOne(uploadStats._id);
            if (uploadStats.stop) {
                OLog.debug(`recordimporter.js importFileCheckStop domainId=${uploadStats.domain} ` +
                    `uploadType=${uploadStats.uploadType} userId=${uploadStats.userId} import stop request detected`)
                VXApp.setUploadStatus(uploadStats.uploadType, "CLEARED", uploadStats.domain)
                RecordImporter.createImportEvent("IMPORT_STOP", uploadStats.uploadType, uploadStats.domain)
                return { success: false, icon: "UPLOAD", type: "INFO", key: "common.alert_upload_stopped", stopped: true }
            }
            return { success: true }
        }
        catch (error) {
            OLog.error(`recordimporter.js importFileCheckStop unexpected error=${OLog.errorError(error)}`)
            return { success: false, icon: "BUG", key: "common.alert_unexpected_error",
                variables: { error: error.toString() }
            }
        }
    },

    /**
     * Iterate over array and perform upsert for each row.
     *
     * @param {object} uploadStats Upload Stats object.
     * @param {object} metadataRoot Metadata root.
     * @param {object} coll Collection into which records should be upserted.
     * @param {array} insertArray Array to be upserted.
     */
    performSimpleUpsert(uploadStats, metadataRoot, coll,  insertArray) {
        const uploadTypeObject = Util.getCodeObject("uploadType", uploadStats.uploadType)
        const modifier = {}
        modifier.$set = {}
        modifier.$set.processed = 0
        modifier.$set.total = insertArray.length
        modifier.$set.status = "UPDATING"
        UploadStats.update(uploadStats._id, modifier)
        let processed = 0
        insertArray.forEach(results => {
            const upsertResults = coll.direct.upsert(results.selector, results.record, {bypassCollection2: true})
            const recordId = results.record._id || upsertResults.insertedId
            if (uploadTypeObject.updateHandler) {
                const updateHandlerFunc = uploadTypeObject.updateHandler()
                const record = coll.findOne(recordId)
                if (record) {
                    updateHandlerFunc(record)
                }
                else {
                    OLog.error("recordimporter.js performSimpleUpsert unable to locate record using " +
                        `recordId=${recordId}`)
                }
            }
            processed++
            UploadStats.update(uploadStats._id, { $set: { processed } })
        })
    },

    /**
     * Find or create the target object into which a property should be set.  This may
     * involve creating a container array and calling hooks on create or update.
     *
     * @param {object} uploadStats Upload stats object.
     * @param {object} metadataRoot Metadata root object.
     * @param {array} metadataPath Metadata path of property to be set.
     * @param {object} record Record being processed.
     * @param {array} pathIndices Path indicies map.
     * @return {object} Target object or possibly the results record.
     */
    findOrCreateTargetObject(uploadStats, metadataRoot, metadataPath,
        record, pathIndices)   {
        const metadataPathArray = metadataPath.split(".")
        let keys
        let targetObject = record
        for (let segmentIndex = 0; segmentIndex < metadataPathArray.length - 1; segmentIndex++) {
            const segment = metadataPathArray[segmentIndex]
            const metadataPathTemp = Util.tokens(metadataPath, ".", segmentIndex)
            const definition = VXApp.findDefinition(metadataRoot, metadataPathTemp)
            if (definition.bindingType === "Array") {
                const pathIndicesObject = _.findWhere(pathIndices, { metadataPath: metadataPathTemp })
                let targetArray = targetObject[segment]
                if (!targetArray) {
                    targetArray = []
                    targetObject[segment] = targetArray
                }
                keys = pathIndicesObject.keys
                targetObject = _.findWhere(targetArray, keys)
                if (!targetObject) {
                    if (pathIndicesObject.isKeyUpdate) {
                        keys = pathIndicesObject.keysPostUpdate
                        targetObject = _.findWhere(targetArray, keys)
                        OLog.warn("recordimporter.js findOrCreateTargetObject key update scenario detected " +
                            `keys=${OLog.warnString(pathIndicesObject.keys)} ` +
                            `keysPostUpdate=${OLog.warnString(pathIndicesObject.keysPostUpdate)} ` +
                            `targetObject=${OLog.warnString(targetObject)}`)
                    }
                }
                if (!targetObject) {
                    targetObject = {}
                    RecordImporter.applyHooks(uploadStats, metadataRoot, metadataPathTemp, record,
                        targetObject, "onCreate")
                    targetObject = { ...targetObject, ...keys }
                    targetArray.push(targetObject)
                }
                else {
                    RecordImporter.applyHooks(uploadStats, metadataRoot, metadataPathTemp, record,
                        targetObject, "onModify")
                }
            }
            else {
                if (!targetObject[segment]) {
                    targetObject[segment] = {}
                    RecordImporter.applyHooks(uploadStats, metadataRoot, metadataPathTemp,  record,
                        targetObject, "onCreate")
                }
                else {
                    RecordImporter.applyHooks(uploadStats, metadataRoot, metadataPathTemp,  record,
                        targetObject, "onModify")
                }
                targetObject = targetObject[segment]
            }
        }
        return targetObject
    },

    /**
     * Ensure that the record key is present.
     *
     * @param {object} uploadStats Upload stats object.
     * @param {object} uploadTypeObject Upload type object from codes.
     * @param {object} metadataRoot Metadata root object.
     * @param {array} metadataPaths Array of column headers (top row).
     * @param {string} metadataPath Metadata path of record key.
     * @param {array} rowObject Row object being processed.
     * @param {array} messages Array of validation messages (mutated in place).
     * @param {object} superCache Cache to improve lookup performance.
     * @return {boolean} True if record key is present and valid.
     */
    validateDataCellsRecordKeyPresent(uploadStats, uploadTypeObject, metadataRoot, metadataPaths,
        metadataPath, rowObject, messages, superCache) {
        const keypathIndex = metadataPaths.indexOf(metadataPath)
        const key = FX.trim.strip(rowObject.row[keypathIndex])
        const validationResults =
            RecordImporter.validateAndTransform(uploadStats, metadataRoot, metadataPath, rowObject,
                key, messages, superCache)
        if (!(validationResults.valid && validationResults.value)) {
            const index = rowObject.index
            const header = VXApp.formatPropertyName(metadataRoot, metadataPath)
            const message = {}
            message.fieldIdKey = "common.field_row_and_header"
            message.fieldIdVariables = { index,  header }
            message.result = { success : false, icon : "TRIANGLE", key : "common.invalid_record_key_missing" }
            messages.push(message)
            return false
        }
        return true
    },

    /**
     * For a tenantitive object update, ensure that all necessary keys are present.
     *
     * @param {object} metadataRoot Metadata root object.
     * @param {string} metadataPath Metadata path of property to be set.
     * @param {object} rowObject Row object being processed.
     * @param {array} messages Messages array.
     * @param {array} pathIndices Path indicies map.
     * @return {boolean} True if all necessary keys are present.
     */
    validateDataCellsKeysPresent(metadataRoot, metadataPath, rowObject,
        messages, pathIndices) {
        if (!metadataPath.includes(".")) {
            return true
        }
        let allValid = true
        const metadataPathArray = metadataPath.split(".")
        for (let segmentIndex = 0; segmentIndex < metadataPathArray.length - 1; segmentIndex++) {
            const metadataPathTemp = Util.tokens(metadataPath, ".", segmentIndex)
            const definition = VXApp.findDefinition(metadataRoot, metadataPathTemp)
            if (definition.bindingType === "Array") {
                const pathIndicesObject = _.findWhere(pathIndices, { metadataPath: metadataPathTemp })
                const valid = RecordImporter.validateDataCellKeysNotNull(pathIndicesObject)
                if (!valid) {
                    const index = rowObject.index
                    const header = VXApp.formatPropertyName(metadataRoot, metadataPath)
                    const list = VXApp.formatPropertyName(metadataRoot, metadataPathTemp)
                    const message = {}
                    message.fieldIdKey = "common.field_row_and_header"
                    message.fieldIdVariables = { index,  header }
                    message.result = { success : false, icon : "TRIANGLE", key : "common.invalid_data_key_missing",
                        variables: { list } }
                    messages.push(message)
                    allValid = false
                }
            }
        }
        return allValid
    },

    /**
     * Analyze a path indices object to determine whether all necessary keys are present.
     *
     * @param {object} pathIndicesObject Path indices object bearing keys.
     * @return {boolean} True if all necessary keys are present.
     */
    validateDataCellKeysNotNull(pathIndicesObject) {
        if (!pathIndicesObject) {
            return false
        }
        for (const name in pathIndicesObject.keys) {
            const value = pathIndicesObject.keys[name]
            if (Util.isNullish(value)) {
                return false
            }
        }
        if (pathIndicesObject.isKeyUpdate) {
            for (const name in pathIndicesObject.keysPostUpdate) {
                const value = pathIndicesObject.keysPostUpdate[name]
                if (Util.isNullish(value)) {
                    return false
                }
            }
        }
        return true
    },

    /**
     * Validate and transform an input value.
     *
     * @param {object} uploadStats Upload stats object.
     * @param {object} metadataRoot Metadata root object.
     * @param {array} metadataPath Metadata path.
     * @param {object} rowObject Row object being processed.
     * @param {string} input Value to be validated and transformed.
     * @param {array} messages Array of validation messages (mutated in place).
     * @param {object} superCache Cache to improve lookup performance.
     * @return {object} Object bearing valid flag and transfomred value if valid.
     */
    validateAndTransform(uploadStats, metadataRoot, metadataPath, rowObject,
        input, messages, superCache) {
        const header = VXApp.formatPropertyName(metadataRoot, metadataPath)
        const index = rowObject.index
        const fieldIdKey = "common.field_row_and_header"
        const fieldIdVariables = { index,  header }
        const definition = VXApp.findDefinition(metadataRoot, metadataPath)
        let valid
        let value = input
        if (definition.required) {
            valid = VXApp.validateRequired(value, index, messages, fieldIdKey, fieldIdVariables)
            return { valid }
        }
        if (!value) {
            return { valid: true }
        }
        if (definition.codeArrayFunction) {
            const functionName = definition.codeArrayFunction.name
            if (!superCache[functionName]) {
                const codeArray = definition.codeArrayFunction(uploadStats.domain)
                superCache[functionName] = codeArray
            }
            const codeArray = superCache[functionName]
            value = VXApp.lookupCode(definition, value, codeArray, index, messages, fieldIdKey, fieldIdVariables)
            valid = !!value
            return { valid, value }
        }
        if (definition.list) {
            if (!superCache[definition.list]) {
                const codeArray = Util.makeCodeArray(definition.list)
                superCache[definition.list] = codeArray
            }
            const codeArray = superCache[definition.list]
            value = VXApp.lookupCode(definition, value, codeArray, index, messages, fieldIdKey, fieldIdVariables)
            valid = !!value
            return { valid, value }
        }
        if (definition.lookup) {
            value = VXApp.lookupValue(uploadStats, value, definition, index, messages, fieldIdKey, fieldIdVariables)
            valid = !!value
            return { valid, value }
        }
        value = definition.format ?
            definition.format.strip(value) : value
        valid = definition.rule ?
            VXApp.validateRule(value, definition.rule, index, messages, fieldIdKey, fieldIdVariables) : true
        return { valid, value }
    },

    /**
     * Return just the current value of a cell.
     *
     * @param {string} input Input from spreadsheet.
     * @return {string} Just the current cell value.
     */
    currentCellValue(input) {
        const strippedInput = FX.trim.strip(input)
        if (!RecordImporter.isKeyUpdate(input)) {
            return strippedInput
        }
        const inputArray = strippedInput.split("=>")
        return inputArray[0].trim()
    },

    /**
     * Return just the proposed value of a cell.
     *
     * @param {string} input Input from spreadsheet.
     * @return {string} Just the current cell value.
     */
    proposedCellValue(input) {
        const strippedInput = FX.trim.strip(input)
        if (!RecordImporter.isKeyUpdate(input)) {
            return strippedInput
        }
        const inputArray = strippedInput.split("=>")
        return inputArray.length > 1 ? inputArray[1].trim() : null
    },

    /**
     * Determine whether key update is requested.
     *
     * @param {string} input Input from spreadsheet.
     * @return {boolean} True if cell has key update operator (=>).
     */
    isKeyUpdate(input) {
        return input ? input.includes("=>") : false
    },

    /**
     * Stop import process.
     *
     * @param {string} uploadType Upload type.
     * @return {object} Result object.
     */
    uploadRequestStop(uploadType) {
        try {
            if (!_.isString(uploadType)) {
                OLog.error(`recordimporter.js uploadRequestStop parameter check failed uploadType=${uploadType}`);
                return { success: false, icon: "EYE", key: "common.alert_parameter_check_failed" }
            }
            const domainId = Util.getCurrentDomainId();
            if (!domainId) {
                OLog.error(`recordimporter.js uploadRequestStop unable to determine domainId of userId=${Meteor.userId()}`);
                return { success: false, icon: "BUG", key: "common.alert_transaction_fail_domain_not_found_for_user",
                    variables: { userId: Meteor.userId() }
                }
            }
            const uploadStats = VXApp.findUploadStats(uploadType, domainId)
            if (!uploadStats) {
                OLog.error(`recordimporter.js uploadRequestStop unable to find upload stats domainId=${domainId} ` +
                    `uploadType=${uploadType}`)
                return { success: false, icon: "BUG", key: "common.alert_transaction_fail_upload_stats_not_found",
                    variables: { domainId: domainId, uploadType: uploadType }
                }
            }
            OLog.debug(`recordimporter.js uploadRequestStop stopping import domainId=${domainId} ` +
                `uploadType=${uploadType}`)
            if (uploadStats.stop) {
                OLog.debug(`recordimporter.js uploadRequestStop domainId=${domainId} ` +
                    `uploadType=${uploadType} already stopped, clearing uploadStats`)
                VXApp.setUploadStatus(uploadType, "CLEARED", domainId)
                return { success: true, icon: "UPLOAD", type: "INFO", key: "common.alert_upload_stop_request_success" }
            }
            UploadStats.update(uploadStats._id, { $set: { stop: true } })
            return { success: true, icon: "UPLOAD", type: "INFO", key: "common.alert_upload_stop_request_success" }
        }
        catch (error) {
            OLog.error(`recordimporter.js uploadRequestStop unexpected error=${OLog.errorError(error)}`);
            return { success: false, icon: "BUG", key: "common.alert_unexpected_error",
                variables: { error: error.toString() }
            }
        }
    },

    /**
     * Create a notification from a standard result object.
     *
     * @param {object} result Result object.
     * @param {string} domainId Domain ID (optional).
     * @param {string} recipientId User ID of recipient.
     */
    createNotificationForResult(result, domainId, recipientId) {
        try {
            const notification = {}
            notification.domain = domainId
            if (result.type) {
                notification.type = result.type
            }
            else {
                notification.type = result.success ? "SUCCESS" : "ERROR"
            }
            if (result.icon) {
                notification.icon = result.icon
            }
            else {
                notification.icon = "ENVELOPE"
            }
            notification.senderId = Util.getSystemUserId()
            notification.recipientId = recipientId
            notification.key = result.key
            notification.variables = result.variables
            Notifications.insert(notification)
            return
        }
        catch (error) {
            OLog.error(`recordimporter.js createNotificationForResult error=${OLog.errorError(error)}`)
            return
        }
    },

    /**
     * Initialize upload stats.
     *
     * @param {string} uploadType Upload type.
     * @param {string} originalFileName Original file name.
     * @param {string} fileType File Type.
     * @param {number} totalSize Total size.
     * @return {object} Result object.
     */
    initUploadStats(uploadType, originalFileName, fileType, totalSize) {
        try {
            OLog.debug("recordimporter.js initUploadStats *start*")
            if (!(_.isString(uploadType) && _.isString(originalFileName) && _.isString(fileType)
                && _.isNumber(totalSize))) {
                OLog.error(`recordimporter.js initUploadStats parameter check failed uploadType=${uploadType} ` +
                    `originalFileName=${originalFileName} fileType=${fileType} totalSize=${totalSize}`)
                return { success: false, icon: "EYE", key: "common.alert_parameter_check_failed" }
            }
            const domainId = Util.getCurrentDomainId()
            if (!domainId) {
                OLog.error(`recordimporter.js initUploadStats unable to determine domainId of userId=${Meteor.userId()}`);
                return { success: false, icon: "BUG", key: "common.alert_transaction_fail_domain_not_found_for_user",
                    variables: { userId: Meteor.userId() } }
            }
            const selector = {}
            selector.domain = domainId
            selector.uploadType = uploadType
            const modifier = {}
            modifier.$set = {}
            modifier.$set.domain = domainId
            modifier.$set.uploadType = uploadType
            modifier.$set.status = "TRANSMITTING"
            modifier.$set.userId = Meteor.userId()
            modifier.$set.originalFileName = originalFileName
            modifier.$set.fileType = fileType
            modifier.$set.totalSize = totalSize
            modifier.$set.processed = 0
            modifier.$set.total = 100
            modifier.$unset = {}
            modifier.$unset.filePath = ""
            modifier.$unset.stop = ""
            modifier.$unset.messages = ""
            UploadStats.upsert(selector, modifier)
            return { success: true, icon: "ENVELOPE", key: "common.alert_transaction_success" }
        }
        catch (error) {
            OLog.error(`recordimporter.js initUploadStats unexpected error=${OLog.errorError(error)}`)
            return { success: false, icon: "BUG", key: "common.alert_unexpected_error",
                variables: { error: error.toString() } }
        }
    },

    /**
     * Create an event record pertaining to spreadsheet import.
     *
     * @param {string} eventType Event type.
     * @param {string} uploadType Upload type.
     * @param {string} domainId Domain ID.
     * @return {object} Result object.
     */
    createImportEvent(eventType, uploadType, domainId) {
        try {
            if (!(_.isString(eventType) && _.isString(uploadType) && (!domainId || _.isString(domainId)))) {
                OLog.error("recordimporter.js createImportEvent parameter check failed " +
                    `eventType=${eventType} uploadType=${uploadType} domainId=${domainId}`)
                return { success: false, icon: "EYE", key: "common.alert_parameter_check_failed" }
            }
            domainId = domainId || Util.getCurrentDomainId()
            if (!domainId) {
                OLog.error(`recordimporter.js createImportEvent unable to determine domainId of userId=${Meteor.userId()}`)
                return { success: false, icon: "BUG", key: "common.alert_transaction_fail_domain_not_found_for_user",
                    variables: { userId: Meteor.userId() } }
            }
            const uploadStats = VXApp.findUploadStats(uploadType, domainId)
            if (!uploadStats) {
                OLog.error(`recordimporter.js createImportEvent unable to find uploadStats for domainId=${domainId} ` +
                    `uploadType=${uploadType}`);
                return { success: false, icon: "BUG", key: "common.alert_transaction_fail_upload_stats_not_found",
                    variables: { domainId: domainId, uploadType: uploadType } }
            }
            OLog.debug(`recordimporter.js createImportEvent domainId=${domainId} eventType=${eventType} ` +
                `uploadType=${uploadType} *current* status=${uploadStats.status}`);
            const eventData = {};
            eventData.uploadType = uploadStats.uploadType;
            eventData.userId = uploadStats.userId;
            eventData.originalFileName = uploadStats.originalFileName
            eventData.fileType = uploadStats.fileType
            VXApp.createEvent(eventType, domainId, eventData, {
                fullName: Util.fetchFullName(uploadStats.userId),
                originalFileName: uploadStats.originalFileName,
                uploadType: Util.getCodeLocalized("uploadType", uploadStats.uploadType)
            })
            return { success: true, icon: "ENVELOPE", key: "common.alert_transaction_success" }
        }
        catch (error) {
            OLog.error(`recordimporter.js createImportEvent unexpected error=${OLog.errorError(error)}`)
            return { success: false, icon: "BUG", key: "common.alert_unexpected_error", variables: {
                error: error.toString() } }
        }
    },

    /**
     * Convert a value from string to its proper storage representation.
     *
     * @param {object} uploadStats Upload stats object.
     * @param {object} definition Import schema definition object.
     * @param {string} value Value to convert.
     * @return {?} Value converted into the proper type.
     */
    convertValue(uploadStats, definition, value) {
        if (Util.isNullish(value)) {
            return null
        }
        if (definition.bindingType === "Date") {
            const timezone = Util.getUserTimezone(uploadStats.userId)
            value = value === "now" ? moment.tz(new Date(), timezone).format(definition.dateFormat) : value
            return Util.parsedValue(definition.bindingType, value, definition.dateFormat, timezone)
        }
        if (definition.bindingType === "Integer") {
            value = FX.integer.strip(value)
        }
        if (definition.bindingType === "Money") {
            value = FX.money.strip(value)
        }
        return Util.parsedValue(definition.bindingType, value)
    },

    /**
     * Apply onCreate and onModify hooks for the supplied object.
     *
     * @param {object} uploadStats Upload stats object.
     * @param {object} metadataRoot Import schemas root.
     * @param {string} metadataPathOfParent Metadata path of parent definition or null for top-level.
     * @param {object} record Record being updated.
     * @param {object} targetObject Object upon which hooks should operate.
     * @param {string} functionName Name of function to call to get value (e.g., onCreate, onModify).
     */
    applyHooks(uploadStats, metadataRoot, metadataPathOfParent,  record,
        targetObject, functionName) {
        const metadataParent = metadataPathOfParent ?
            VXApp.findDefinition(metadataRoot, metadataPathOfParent) : metadataRoot
        if (!metadataParent) {
            OLog.error(`recordimporter.js applyHooks unable to find metadataParent using metadataPathOfParent=${metadataPathOfParent}`)
            return null
        }
        const propertyContainer = metadataParent.definition ? metadataParent.definition : metadataParent
        for (const propertyName in propertyContainer) {
            const definition = propertyContainer[propertyName]
            if (definition[functionName]) {
                targetObject[propertyName] = definition[functionName](uploadStats, record, targetObject, propertyName)
            }
        }
    }
}
