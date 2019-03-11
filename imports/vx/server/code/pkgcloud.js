"use strict"

/**
 * PkgCloud API.
 */
PkgCloud = {

    /**
     * Upload an image file.
     *
     * @param {string} prefix Prefix of image file path (e.g., "img/profile/W9wwLbJeQRD546TTt")
     * @param {string} filename File name to be uploaded (e.g., "3202cb47-10ee-4189-8c1c-df47843fbde3.png")
     * @param {string} content Content of the image file in Data URI format.
     * @return {object} Response object.
     */
    putImage : (filename, content) => {

        var fut, clientRackspace, readableStream, pkgcloud, stripped, buffer, bufferStream, rackspaceWriteStream, mimeType, result

        try {

            pkgcloud = require("pkgcloud")
            readableStream = require("readable-stream")

            OLog.debug("pkgcloud.js putImage CX.PKGCLOUD_CLIENT_OPTIONS=" + OLog.debugString(CX.PKGCLOUD_CLIENT_OPTIONS) +
                " CX.PKGCLOUD_CONTAINER=" + CX.PKGCLOUD_CONTAINER)

            clientRackspace = pkgcloud.storage.createClient(CX.PKGCLOUD_CLIENT_OPTIONS)

            stripped = content.replace(/^data:image\/\w+;base64,/, "")
            buffer = new Buffer(stripped, "base64")

            bufferStream = new readableStream.PassThrough()
            bufferStream.end(buffer)

            mimeType = Util.getMimeType(content)
            if (!mimeType) {
                OLog.error("pkgcloud.js putImage error could not determine MIME type of content=" + content)
                return { success : false, icon : "EYE", key : "common.alert_parameter_check_failed"}
            }

            OLog.debug("pkgcloud.js putImage filename=" + filename + " length=" + buffer.length + " mimeType=" + mimeType)

            rackspaceWriteStream = clientRackspace.upload( { container: CX.PKGCLOUD_CONTAINER, remote: filename } )

            fut = new Future()

            rackspaceWriteStream.on("error", function(error) {
                fut.return( { error : error } )
            })

            rackspaceWriteStream.on("success", function(fileModel) {
                fut.return( { fileModel : fileModel } )
            })

            OLog.debug("pkgcloud.js putImage starting *pipe*")

            bufferStream.pipe(rackspaceWriteStream)

            result = fut.wait()

            if (result.error) {
                OLog.error("pkgcloud.js putImage *error* returned from pipe operation error=" + result.error)
                return { success : false, type : "ERROR", icon : "BUG", key : "common.alert_unexpected_error", variables : { error : result.error.toString() } }
            }

            if (!result.fileModel) {
                OLog.error("pkgcloud.js putImage *error* returned from pipe operation no file model returned")
                return { success : false, type : "ERROR", icon : "BUG", key : "common.alert_unexpected_error" }
            }

            OLog.debug("pkgcloud.js putImage *success* container=" + result.fileModel.container + " name=" +
                result.fileModel.name + " etag=" + result.fileModel.etag)

            return { success : true, icon : "ENVELOPE", key : "common.alert_transaction_success" }
        }
        catch (error) {
            OLog.error("pkgcloud.js putImage unexpected error=" + error)
            return { success : false, type : "ERROR", icon : "BUG", key : "common.alert_unexpected_error", variables : { error : error.toString() } }
        }
    }
}
