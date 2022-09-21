import fs from "fs"
import {get, set} from "lodash"
import async from "async"

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
                Meteor.setTimeout(() => {
                    const result = RecordImporter.importFile(uploadStats)
                    let status
                    if (result.success) {
                        status = !result.errors ? "COMPLETED" : "COMPLETED_WITH_ERRORS"
                    }
                    else if (result.stopped) {
                        status = "STOPPED"
                    }
                    else {
                        status = "FAILED"
                    }
                    const modifier = {}
                    modifier.$set = {}
                    modifier.$set.status = status
                    OLog.debug(`recordimporter.js findImportRequests result=${OLog.debugString(result)} ` +
                        `status=${status} domainId=${uploadStats.domain} uploadType=${uploadStats.uploadType} ` +
                        `uploadStats.uploadParameters=${OLog.debugString(uploadStats.uploadParameters)} ` +
                        `requestor=${Util.getUserEmail(uploadStats.userId)} modifier=${OLog.debugString(modifier)}`)
                    UploadStats.update(uploadStats._id, modifier)
                    RecordImporter.createNotificationForResult(result, uploadStats.domain, uploadStats.userId)
                })
            })
        }
        catch (error) {
            OLog.error(`recordimporter.js findImportRequests unexpected error=${error}`)
            return
        }
    },

    /**
     * Locate and reset any import requests of the specified type in progress.
     */
    resetPendingImportRequests() {
        const selector = {}
        selector.status = {}
        selector.$in = ["ACTIVE", "TRANSMITTING", "WAITING", "INSERTING"]
        UploadStats.find(selector).forEach(uploadStats => {
            OLog.debug(`recordimporter.js resetPendingImportRequests *found* domainId=${uploadStats.domain} ` +
                `uploadType=${uploadStats.uploadType} requestor=${Util.getUserEmail(uploadStats.userId)}`)
            VXApp.setUploadStatus(uploadStats.uploadType, "CLEARED", uploadStats.domain)
            RecordImporter.createImportEvent("LIST_IMPORT_RESET", uploadStats.uploadType, uploadStats.domain)
        })
    },

    /**
     * Import CSV file into MongoDB.
     *
     * @param {object} uploadStats Upload stats object.
     * @return {object} Result object.
     */
    importFile(uploadStats) {
        try {
            if (!_.isObject(uploadStats)) {
                OLog.error("recordimporter.js importFile parameter check failed uploadStats=" + uploadStats)
                return { success: false, icon: "EYE", key: "common.alert_parameter_check_failed" }
            }
            const messages = []
            OLog.debug("recordimporter.js importFile importing " +
             `domainId=${uploadStats.domain} uploadType=${uploadStats.uploadType} ` +
             `uploadStats.uploadParameters=${OLog.debugString(uploadStats.uploadParameters)} ` +
             `filePath=${uploadStats.filePath}`)
            const result = RecordImporter.importFileParse(uploadStats, messages)
            if (result.stopped) {
                return result
            }
            if (!result.success) {
                RecordImporter.createImportEvent("LIST_IMPORT_FAIL", uploadStats.uploadType, uploadStats.domain)
                return result
            }
            OLog.debug(`recordimporter.js importFile domainId=${uploadStats.domain} ` +
                `uploadType=${uploadStats.uploadType} messages length=${messages.length}`)
            RecordImporter.createImportEvent("LIST_IMPORT_FINISH", uploadStats.uploadType, uploadStats.domain)
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
            OLog.error(`recordimporter.js importFile unexpected error=${error}`)
            return { success: false, icon: "BUG", key: "common.alert_unexpected_error",
                variables: { error: error.toString() }
            }
        }
    },

    /**
     * Upload a list of recipients: parse CSV into large result object. This is a complicated asynchronous
     * process that involves a stream and a queue. Unfortunately there is no way to make this simpler because
     * of the CSV package API, that is very stream-oriented.
     *
     * uploadWaitInterval   delay interval to avoid overwhelming MongoDB
     * uploadChunkSize      Maximum number of rows to process in a single Insert task
     *
     * totalSize            total size of the input file in bytes
     * chunkRead            number of bytes read in the current chunk
     * read Total           number of bytes read from the file absolute
     * processed            bytes processed in file
     *
     * streamRead           total number of records read thus far
     * streadProcessed      total number of records process (essentially count written to database)
     * streamTotal          total number of records retreived from CSV file
     *
     * @param {object} uploadStats Upload stats object.
     * @param {array} messages Array of messages mutated in place.
     * @return {object} Result object.
     */
    importFileParse(uploadStats, messages) {

        let fut, readStream, stream, abort, read, processed, total, readPercentOld, readPercentNew, rowArray,
            streamRead, streamProcessed, streamTotal, result, streamQueue, chunkRead, chunkNumber, uploadWaitInterval,
            uploadChunkSize, indexStart, modifier, headerArray

        try {
            uploadWaitInterval = Util.getConfigValue("uploadWaitInterval")
            uploadChunkSize = Util.getConfigValue("uploadChunkSize")
            indexStart = 1
            OLog.debug(`recordimporter.js importFileParse domainId=${uploadStats.domain} ` +
                `uploadType=${uploadStats.uploadType} userId=${uploadStats.userId} filePath=${uploadStats.filePath} ` +
                `totalSize=${uploadStats.totalSize} uploadWaitInterval=${uploadWaitInterval} ` +
                `uploadChunkSize=${uploadChunkSize}`)

            headerArray = []

            read = 0
            processed = 0
            total = uploadStats.totalSize

            readPercentOld = 0
            chunkRead = 0
            chunkNumber = 0
            abort = false

            modifier = {}
            modifier.$set = {}
            modifier.$set.filePath = uploadStats.filePath
            modifier.$set.totalSize = uploadStats.totalSize
            modifier.$set.processed = processed
            modifier.$set.total = total
            UploadStats.update(uploadStats._id, modifier)

            fut = new Future()
            rowArray = []
            streamQueue = async.queue(Meteor.bindEnvironment((task, callback) => {
                try {
                    if (abort) {
                        return
                    }
                    result = RecordImporter.importFileChunk(uploadStats, task.rowArray, messages, task.name, headerArray)
                    if (!result.success) {
                        fut.return(result)
                        return
                    }
                    result = RecordImporter.importFileCheckStop(uploadStats)
                    if (!result.success) {
                        fut.return(result)
                        return
                    }
                    streamProcessed += task.rowArray.length
                    processed += task.chunkRead
                    const chunkReadString = task.rowArray.length > 0 ?
                        ` from ${task.rowArray[0].rowIndex} to ${task.rowArray[task.rowArray.length - 1].rowIndex}` : ""
                    OLog.debug(`recordimporter.js importFileParse domainId=${uploadStats.domain} ` +
                        `uploadType=${uploadStats.uploadType} userId=${uploadStats.userId} *arrayed* ${task.name} ` +
                        `chunkRead=${task.chunkRead}${chunkReadString} streamRead=${streamRead} ` +
                        `streamProcessed=${streamProcessed} streamTotal=${streamTotal} read=${read} ` +
                        `processed=${processed} total=${total}`)
                    // Defer state change from WAITING -> INSERTING until first chunk for UI progress.
                    // This causes progress bar to remain in WAITING animation until we have non-zero
                    // at least some insertions.
                    modifier = {}
                    modifier.$set = {}
                    modifier.$set.status = "INSERTING"
                    modifier.$set.processed = processed
                    UploadStats.update(uploadStats._id, modifier)
                    // Throttle workers to avoid overwhelming MongoDB:
                    Meteor.setTimeout(() => {
                        callback()
                    }, uploadWaitInterval)
                }
                catch (error) {
                    OLog.error(`recordimporter.js importFileParse *error* async.queue filePath=${uploadStats.filePath} ` +
                        `error=${error}`)
                    fut.return({ success: false, icon: "BUG", key: "common.alert_unexpected_error",
                        variables: { error: error.toString() } })
                    return
                }
            }), 1)

            readStream = fs.createReadStream(uploadStats.filePath)
            readStream.on("error", Meteor.bindEnvironment(error => {
                OLog.error(`recordimporter.js importFileParse *error* on read stream filePath=${uploadStats.filePath} ` +
                    `error=${error}`)
                fut.return({ success: false, icon: "BUG", key: "common.alert_unexpected_error",
                    variables: { error: error.toString() } })
                return
            }));

            stream = CSV().from.stream(readStream, { "escape": "\\" });

            streamRead = 0
            streamProcessed = 0
            streamTotal = undefined

            readStream.on("data", data => {
                chunkRead += data.length;
                read += data.length;
            })

            //readStream.emit("error", new Error("Really bad thing happened"));

            stream.on("record", Meteor.bindEnvironment((row, rowIndex) => {
                try {
                    if (abort) {
                        return
                    }
                    streamRead++
                    rowArray.push({ index: (rowIndex - 1) + indexStart, rowIndex: rowIndex, row: row })
                    readPercentNew = Math.floor(read * 100 / total)
                    // Control break:
                    if (rowArray.length >= uploadChunkSize || readPercentNew !== readPercentOld || streamRead === streamTotal) {
                        readPercentOld = readPercentNew
                        if (rowArray.length > 0) {
                            enqueue("Insert", streamQueue, uploadStats, rowArray, streamRead, streamProcessed, streamTotal,
                                chunkNumber, chunkRead)
                        }
                        if (streamRead === streamTotal) {
                            OLog.debug(`recordimporter.js importFileParse  domainId=${uploadStats.domain} `  +
                                `uploadType=${uploadStats.uploadType} userId=${uploadStats.userId} *last-read* ` +
                                `filePath=${uploadStats.filePath} streamRead=${streamRead} streamTotal=${streamTotal}`)
                        }
                    }
                }
                catch (error) {
                    OLog.error(`recordimporter.js importFileParse CSV stream on record callback unexpected error=${error}`);
                    fut.return({ success: false, icon: "BUG", key: "common.alert_unexpected_error",
                        variables: { error: error.toString() }
                    })
                    return
                }
            }))

            stream.on("end", Meteor.bindEnvironment(streamFinalCount => {
                streamTotal = streamFinalCount
                streamQueue.drain(() => {
                    OLog.debug(`recordimporter.js importFileParse domainId=${uploadStats.domain} ` +
                        `uploadType=${uploadStats.uploadType} userId=${uploadStats.userId} *drain* ` +
                        `streamRead=${streamRead} streamProcessed=${streamProcessed} streamTotal=${streamTotal} ` +
                        `rowArray.length=${rowArray.length} chunkRead=${chunkRead}`)
                    if (rowArray.length > 0) {
                        enqueue("Drain", streamQueue, uploadStats, rowArray, streamRead,
                            streamProcessed, streamTotal, chunkNumber, chunkRead)
                        return
                    }
                    // Because the streams run asynchronously, it is possible for there to be a non-zero value in chunkRead
                    // after the final record has already been processed.  This can throw off the progress bar which always
                    // needs to end at 100%:
                    if (chunkRead > 0) {
                        processed += chunkRead
                        UploadStats.update(uploadStats._id, { $set: { processed: processed }})
                    }
                    fut.return({ success: true })
                    return
                })
                OLog.debug(`recordimporter.js importFileParse domainId=${uploadStats.domain} ` +
                    `uploadType=${uploadStats.uploadType} userId=${uploadStats.userId} *end* streamRead=${streamRead} ` +
                    `streamProcessed=${streamProcessed} streamTotal=${streamTotal} rowArray.length=${rowArray.length} ` +
                    `chunkRead=${chunkRead}`)
                if (rowArray.length > 0) {
                    enqueue("End", streamQueue, uploadStats, rowArray, streamRead,
                        streamProcessed, streamTotal, chunkNumber, chunkRead)
                    return
                }
            }))
            stream.on("error", Meteor.bindEnvironment(error => {
                OLog.error(`recordimporter.js importFileParse domainId=${uploadStats.domain} ` +
                    `uploadType=${uploadStats.uploadType} userId=${uploadStats.userId} *error* ` +
                    `filePath=${uploadStats.filePath} error=${error}`)
                fut.return({ success: false, icon: "TRIANGLE", type: "ERROR", key: "common.alert_csv_unexpected_error",
                    variables: { error: error.toString() }
                })
                return
            }))
            //stream.emit("error", new Error("Really bad thing happened"));
            result = fut.wait();
            OLog.debug(`recordimporter.js importFileParse domainId=${uploadStats.domain} ` +
                `uploadType=${uploadStats.uploadType} userId=${uploadStats.userId} *destroy*`)
            readStream.destroy()
            if (!result.success) {
                OLog.debug("recordimporter.js importFileParse process was not successful, setting abort mode");
                abort = true
            }
            return result
        }
        catch (error) {
            OLog.error(`recordimporter.js importFileParse unexpected error=${error}`);
            return { success: false, icon: "BUG", key: "common.alert_unexpected_error",
                variables: { error: error.toString() }
            }
        }

        function enqueue(caller) {
            OLog.debug(`recordimporter.js importFileParse domainId=${uploadStats.domain} ` +
                `uploadType=${uploadStats.uploadType} userId=${uploadStats.userId} *enqueue* ${caller} ` +
                `${chunkNumber} from ${rowArray[0].rowIndex} to ${rowArray[rowArray.length - 1].rowIndex} ` +
                `streamRead=${streamRead} streamProcessed=${streamProcessed} streamTotal=${streamTotal}`)
            streamQueue.push({ name: caller + " " + chunkNumber, rowArray: rowArray, chunkRead: chunkRead})
            chunkNumber++
            rowArray = []
            chunkRead = 0
        }
    },

    /**
     * Check for stop request from user.  If detected, emit LIST_IMPORT_STOP.
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
                RecordImporter.createImportEvent("LIST_IMPORT_STOP", uploadStats.uploadType, uploadStats.domain)
                return { success: false, icon: "UPLOAD", type: "INFO", key: "common.alert_upload_stopped", stopped: true }
            }
            return { success: true }
        }
        catch (error) {
            OLog.error(`recordimporter.js importFileCheckStop unexpected error=${error}`)
            return { success: false, icon: "BUG", key: "common.alert_unexpected_error",
                variables: { error: error.toString() }
            }
        }
    },

    /**
     * Given a "chunk" of rows, validate and insert data into MongoDB.  Iterate over all
     * of the rows in the chunk and build an array of records suitable for Meteor batch insert.
     *
     * @param {object} uploadStats Upload stats object.
     * @param {object} rowArray Chunk of rows.
     * @param {array} messages Array of messages mutated in place.
     * @param {string} taskName Task name from worker.
     * @param {string} headerArray Anchor to headerArray.
     * @return {object} Result object.
     */
    importFileChunk(uploadStats, rowArray, messages, taskName, headerArray) {
        try {
            OLog.debug(`recordimporter.js importFileChunk domainId=${uploadStats.domain} ` +
                `uploadType=${uploadStats.uploadType} userId=${uploadStats.userId} *prepare* ${taskName} ` +
                `records=${rowArray.length}`)
            const insertArray = []
            const uploadTypeObject = Util.getCodeObject("uploadType", uploadStats.uploadType)
            if (uploadTypeObject.validateHeaders && headerArray.length === 0) {
                Array.prototype.push.apply(headerArray, rowArray[0].row)
                const valid = VXApp.validatePaths(Meta[uploadStats.uploadType], headerArray,
                    messages, "common.header_path_specification")
                if (!valid) {
                    OLog.debug("recordimporter.js prepareGeneric *abort* header has invalid path one or more invalid paths")
                    return { success: true }
                }
                const commandColumnIndex = VXApp.validateCommandColumn(headerArray, messages, "common.header_path_specification")
                if (commandColumnIndex < 0) {
                    return { success: true }
                }
            }
            const commandColumnIndex = VXApp.validateCommandColumn(headerArray, messages, "common.header_path_specification")
            _.each(rowArray, rowObject => {
                if (rowObject.index === 0) {
                    OLog.debug(`recordimporter.js importFileChunk domainId=${uploadStats.domain} ` +
                        `uploadType=${uploadStats.uploadType} userId=${uploadStats.userId} ` +
                        `*header* headerArray=${headerArray}`)
                    return
                }
                try {
                    const func = get(global, uploadTypeObject.prepareFunctionName)
                    func(uploadStats, uploadTypeObject, headerArray, commandColumnIndex, rowObject.row,
                        rowObject.index, rowObject.rowIndex, messages, insertArray)
                }
                catch (error) {
                    OLog.error("recordimporter.js importFileChunk unexpected error " +
                        `uploadType=${uploadStats.uploadType} error=${error}`)
                }
            })
            if (insertArray.length === 0) {
                return { success: true }
            }
            OLog.debug(`recordimporter.js importFileChunk domainId=${uploadStats.domain} ` +
                `uploadType=${uploadStats.uploadType} userId=${uploadStats.userId} taskName=${taskName} ` +
                `*persisting* records=${insertArray.length}`)
            const coll = Util.getCollection(uploadTypeObject.collection)
            switch (uploadTypeObject.insertMode) {
            case "UPSERT":
                RecordImporter.performSimpleUpsert(coll, uploadStats, taskName, insertArray)
                break
            case "BATCH":
                RecordImporter.performBatchInsert(coll, uploadStats, taskName, insertArray)
                break
            }
            return { success: true }
        }
        catch (error) {
            OLog.error(`recordimporter.js importFileChunk unexpected error=${error}`)
            return { success: false, icon: "BUG", key: "common.alert_unexpected_error",
                variables: { error: error.toString() } }
        }
    },

    /**
     * Iterate over array and perform upsert for each row.
     *
     * @param {object} coll Collection into which records should be upserted.
     * @param {object} uploadStats Upload Stats object.
     * @param {string} taskName Task name for logging.
     * @param {array} insertArray Array to be upserted.
     */
    performSimpleUpsert(coll, uploadStats, taskName, insertArray) {
        insertArray.forEach(result => {
            OLog.debug(`recordimporter.js performSimpleUpsert domainId=${uploadStats.domain} ` +
                `uploadType=${uploadStats.uploadType} userId=${uploadStats.userId} taskName=${taskName} ` +
                `selector=${OLog.debugString(result.selector)} record=${OLog.debugString(result.record)}`)
            coll.direct.upsert(result.selector, result.record, {bypassCollection2: true})
        })
    },

    /**
     * Batch insert an array into a collection.
     *
     * @param {object} coll Collection into which records should be inserted.
     * @param {object} uploadStats Upload Stats object.
     * @param {string} taskName Task name for logging.
     * @param {array} insertArray Array to be inserted.
     */
    performBatchInsert(coll, uploadStats, taskName, insertArray) {
        const records = _.pluck(insertArray, "record")
        coll.batchInsert(records, error => {
            OLog.debug(`recordimporter.js performBatchInsert domainId=${uploadStats.domain} ` +
                `uploadType=${uploadStats.uploadType} userId=${uploadStats.userId} taskName=${taskName} ` +
                `*inserted* records=${insertArray.length}`)
            if (error) {
                OLog.error("recordimporter.js performBatchInsert unexpected error occurred during batch " +
                    `insert error=${error}`)
                return
            }
        });
    },

    /**
     * Transform a generic row from the CSV into an object in the
     * insertArray suitable for calling batch insert.
     *
     * @param {object} uploadStats Upload stats object.
     * @param {object} uploadTypeObject Upload type object from codes.
     * @param {array} headerArray Array of column headers (top row).
     * @param {number} commandColumnIndex Index of command column.
     * @param {array} row Row being processed.
     * @param {number} index Absolute index (in collection) of record to be created.
     * @param {number} rowIndex Index of row in spreadsheet (first data records is 1).
     * @param {array} messages Array of validation messages (mutated in place).
     * @param {array} insertArray Array of records to be inserted (mutated in place).
     */
    prepareGeneric(uploadStats, uploadTypeObject, headerArray, commandColumnIndex,
        row, index, rowIndex, messages, insertArray) {
        const fieldIdKey = "common.field_id_path_specification"
        const metadataRoot = Meta[uploadStats.uploadType]
        const keypathIndex = headerArray.indexOf(uploadTypeObject.keypath)
        const command = row[commandColumnIndex]
        const valid = VXApp.validateCommand(command, index, messages, fieldIdKey, { rowIndex: rowIndex,  path: "command" })
        if (!valid) {
            OLog.debug(`recordimporter.js prepareGeneric *bypassing* index=${index} invalid command=${command}`)
            return
        }
        const value = FX.trim.strip(row[keypathIndex])
        const results = {}
        results.selector = {}
        results.selector.domain = uploadStats.domain
        results.selector[uploadTypeObject.keypath] = value
        // For command create we start off with a completely empty record except for audit/overhead fields:
        if (command === "create") {
            results.record = {}
            results.record.dateCreated = new Date()
            results.record.userCreated = uploadStats.userId
            results.record.domain = uploadStats.domain
            RecordImporter.processRow(uploadStats, metadataRoot, headerArray, row, index, rowIndex,
                messages, fieldIdKey, results, insertArray)
            return
        }
        // For command update we first read the existing record using the value in the keypath column.
        // The record is used as the foundation for the update.
        if (command === "update") {
            const coll = Util.getCollection(uploadTypeObject.collection)
            results.record = coll.findOne(results.selector)
            if (!results.record) {
                VXApp.validateRecordNotFound(index, messages, "common.field_id_path_specification",
                    { rowIndex: rowIndex,  path: uploadTypeObject.keypath }, value)
                return
            }
            RecordImporter.processRow(uploadStats, metadataRoot, headerArray, row, index, rowIndex,
                messages, fieldIdKey, results, insertArray)
            return
        }
        // For command retire we'll retire the record right here:
        if (command === "retire") {
            const coll = Util.getCollection(uploadTypeObject.collection)
            results.record = coll.findOne(results.selector)
            if (!results.record) {
                VXApp.validateRecordNotFound(index, messages, "common.field_id_path_specification",
                    { rowIndex: rowIndex,  path: uploadTypeObject.keypath })
                return
            }
            const modifier = {}
            modifier.$set = {}
            modifier.$set.dateRetired = new Date()
            modifier.$set.userRetired = uploadStats.userId
            coll.direct.update(results.record._id, modifier)
            OLog.debug(`recordimporter.js prepareGeneric index=${index} ` +
                `collection=${uploadTypeObject.collection} recordId=${results.record._id} *retired*`)
            return
        }
    },

    /**
     * Process the entire row copying cells into results.record.
     */
    processRow(uploadStats, metadataRoot, headerArray, row, index, rowIndex, messages,
        fieldIdKey, results, insertArray) {
        results.record.dateModified = new Date()
        results.record.userModified = uploadStats.userId
        let allValid = true
        headerArray.forEach((path, columnIndex) => {
            if (path === "command") {
                return
            }
            const fieldIdVariables = { rowIndex: rowIndex,  path: path }
            const metadataPath = VXApp.metadataPath(path)
            const definition = VXApp.findDefinition(metadataRoot, metadataPath)
            let value = FX.trim.strip(row[columnIndex])
            let valid = true
            if (definition.required) {
                valid = VXApp.validateRequired(value, index, messages, fieldIdKey, fieldIdVariables)
                if (!valid) {
                    allValid = false
                    return
                }
            }
            if (!value) {
                return
            }
            if (definition.guid) {
                value = Util.getGuid()
            }
            if (definition.lookup) {
                value = VXApp.lookupValue(uploadStats, value, definition, index, messages, fieldIdKey, fieldIdVariables)
            }
            if (definition.format) {
                value = definition.format.strip(value)
            }
            if (definition.list) {
                const codeArray = Util.makeCodeArray(definition.list)
                value = VXApp.lookupCode(definition, value, codeArray, index, messages, fieldIdKey, fieldIdVariables)
            }
            if (definition.codeArrayFunction) {
                const codeArray = definition.codeArrayFunction(uploadStats.userId)
                value = VXApp.lookupCode(definition, value, codeArray, index, messages, fieldIdKey, fieldIdVariables)
            }
            if (definition.rule) {
                valid = VXApp.validateRule(value, definition.rule, index, messages, fieldIdKey, fieldIdVariables)
            }
            if (!valid) {
                allValid = false
                return
            }
            const peerGuidPath = RecordImporter.peerGuidPath(metadataRoot, path)
            if (peerGuidPath) {
                const existingGuid = get(results.record, peerGuidPath)
                if (!existingGuid) {
                    set(results.record, peerGuidPath, Util.getGuid())
                }
            }
            const convertedValue = RecordImporter.convertValue(uploadStats, definition, value)
            set(results.record, path, convertedValue)
        })
        RecordImporter.postProcess(metadataRoot, results.record)
        if (allValid) {
            insertArray.push(results)
            return
        }
        OLog.debug(`recordimporter.js prepareGeneric *bypassing* index=${index} allValid=${allValid} ` +
                `messages=${OLog.debugString(messages)}`)
        return
    },

    /**
     * Post-process the results eliminating incomplete array elements, or elements with missing
     * required properties.
     *
     * @param {object} metadataRoot Metadata root node.
     * @param {object} record Record to be post-processed.
     */
    postProcess(metadataRoot, record) {
        Util.removeNullsFromArrays(record)
        const pathArray = RecordImporter.pathArrayToRequiredProperties(metadataRoot, [], [])
        pathArray.forEach(path => {
            const segments = path.split(".")
            RecordImporter.removeInvalidNodes(record, segments, 0, "")
        })
    },

    /**
     * Create and return an array of metadata paths to any metadata node where
     * requiredInOccurrence is set.
     *
     * @param {object} metadataParent Metadata node.
     * @return {array} Metadata path array.
     */
    pathArrayToRequiredProperties(metadataParent, pathStack, pathArray) {
        Object.keys(metadataParent).forEach(key => {
            pathStack.push(key)
            const metadataNode = metadataParent[key]
            if (metadataNode.requiredInOccurrence) {
                const path = pathStack.join(".")
                pathArray.push(path)
            }
            if (metadataNode.definition) {
                RecordImporter.pathArrayToRequiredProperties(metadataNode.definition, pathStack, pathArray)
            }
            pathStack.pop()
        })
        return pathArray
    },

    /**
     * Remove invalid properties.
     *
     * @param {object} node To-level record or node within record to be processed.
     * @param {array} segments Path segments array.
     * @param {number} segmentIndex Current segment index.
     * @param {string} stem Path stem.
     * @param {number} currentArray Current array being processed.
     * @param {number} currentIndex Current array index being processed.
     */
    removeInvalidNodes(node, segments, segmentIndex, stem, currentArray, currentIndex) {
        const segmentName = segments[segmentIndex]
        const property = get(node, segmentName)
        if (segmentIndex === segments.length - 1) {
            if (!currentArray || Util.isNullish(currentIndex)) {
                OLog.error(`recordimporter.js removeInvalidNodes stem=${stem} segmentName=${segmentName} ` +
                    "currentArray and/or currentIndex are not properly initialized")
                return
            }
            if (Util.isNullish(property)) {
                OLog.debug(`recordimporter.js removeInvalidNodes stem=${stem} ` +
                    `currentIndex=${currentIndex} will be removed because it lacks required field ${segmentName}`)
                currentArray.splice(currentIndex, 1)
            }
            return
        }
        if (_.isArray(property)) {
            for (let arrayIndex = 0; arrayIndex < property.length; arrayIndex++) {
                const path = (stem ? `${stem}.` : "") + `${segmentName}[${arrayIndex}]`
                segmentIndex++
                RecordImporter.removeInvalidNodes(get(node, path), segments, segmentIndex, path, property, arrayIndex)
            }
            return
        }
        if (_.isObject(property)) {
            const path = `${stem}.${segmentName}`
            segmentIndex++
            RecordImporter.removeInvalidNodes(get(node, path), segments, segmentIndex, path)
            return
        }
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
            const domainId = Util.getCurrentDomainId(Meteor.userId());
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
            OLog.error(`recordimporter.js uploadRequestStop unexpected error=${error}`);
            return { success: false, icon: "BUG", key: "common.alert_unexpected_error",
                variables: { error: error.toString() }
            }
        }
    },

    /**
     * Create a notification from a standard result object.
     *
     * @param {string} result Result object.
     * @param {string} recipientId User ID of recipient.
     * @param {string} domainId Domain ID (optional).
     * @param {string} userId User ID (optional).
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
            OLog.error(`recordimporter.js createNotificationForResult error=${error}`)
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
            const domainId = Util.getCurrentDomainId(Meteor.userId())
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
            OLog.error(`recordimporter.js initUploadStats unexpected error=${error}`)
            return { success: false, icon: "BUG", key: "common.alert_unexpected_error",
                variables: { error: error.toString() } }
        }
    },

    /**
     * Create an event record pertaining to CSV import.
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
            domainId = domainId || Util.getCurrentDomainId(Meteor.userId())
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
            OLog.error(`recordimporter.js createImportEvent unexpected error=${error}`)
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
     * Find the path to a peer GUID if any.
     *
     * @param {object] metadataRoot Import schemas root.
     * @param {string} path Lodash-style get/set path.
     * @return {string} Lodash-style get/set path to peer-level GUID.
     */
    peerGuidPath(metadataRoot, path) {
        const metadataPathOfParent = RecordImporter.removeLast(VXApp.metadataPath(path))
        if (!metadataPathOfParent) {
            return null
        }
        const metadataParent = VXApp.findDefinition(metadataRoot, metadataPathOfParent)
        if (!metadataParent) {
            OLog.error(`recordimporter.js peerGuidPath unable to find metadataParent using metadataPathOfParent=${metadataPathOfParent}`)
            return null
        }
        if (!metadataParent.definition) {
            OLog.error(`recordimporter.js peerGuidPath metadataParent has no definition metadataPathOfParent=${metadataPathOfParent}`)
            return null
        }
        for (const propertyName in metadataParent.definition) {
            const peerDefinition = metadataParent.definition[propertyName]
            if (peerDefinition.guid) {
                return `${RecordImporter.removeLast(path)}.${propertyName}`
            }
        }
        return null
    },

    /**
     * Remove the last node of the given dot-separated path.
     *
     * @param {string} path Path.
     * @return {string} Path without last node.
     */
    removeLast(path) {
        const pathArray = path.split(".")
        pathArray.pop()
        return pathArray.join(".")
    }
}
