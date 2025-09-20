import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"

PkgCloud = {

    /**
     * Upload an image file.
     *
     * @param {string} filename File name to be uploaded (e.g., "3202cb47-10ee-4189-8c1c-df47843fbde3.png")
     * @param {string} content Content of the image file in Data URI format.
     * @return {object} Response object.
     */
    async putImage(filename, content) {
        try {
            const client = new S3Client({
                region: process.env.AMAZON_REGION,
                credentials: {
                    accessKeyId: process.env.AMAZON_KEY_ID,
                    secretAccessKey: process.env.AMAZON_KEY
                }
            })
            const stripped = content.replace(/^data:image\/\w+;base64,/, "")
            const binary = Buffer.from(stripped, "base64")
            const mimeType = Util.getMimeType(content)
            if (!mimeType) {
                OLog.error(`pkgcloud.js putImage error could not determine MIME type of content=${content}`)
                return { success : false, icon : "EYE", key : "common.alert_parameter_check_failed"}
            }
            OLog.debug(`pkgcloud.js putImage filename=${filename} length=${binary.length} mimeType=${mimeType}`)
            const command = new PutObjectCommand({
                Bucket: CX.PKGCLOUD_CONTAINER,
                Key: filename,
                Body: binary,
                ContentType: mimeType
            })
            const response = await client.send(command)
            OLog.debug(`pkgcloud.js putImage *success* httpStatusCode=${OLog.debugString(response?.$metadata?.httpStatusCode)}`)
            return { success : true, icon : "ENVELOPE", key : "common.alert_transaction_success" }
        }
        catch (error) {
            OLog.error(`pkgcloud.js putImage unexpected error=${OLog.errorError(error)}`)
            return { success : false, type : "ERROR", icon : "BUG", key : "common.alert_unexpected_error", variables : { error : error.toString() } }
        }
    }
}
