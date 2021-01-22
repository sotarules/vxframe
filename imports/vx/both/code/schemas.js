Schema.checkMongoIdSingle = (schema, collection, value) => {
    let record = collection.findOne(value, { fields: { "_id" : 1 } })
    if (!record) {
        OLog.error("schema.js checkMongoIdSingle collection=" + collection._name + " definition=" + OLog.errorString(schema.definition) + " value=" + schema.value + " *invalid*")
        return "notAllowed"
    }
    //OLog.debug("schema.js checkMongoId collection=" + collection._name + " definition=" + OLog.debugString(schema.definition) + " value=" + schema.value+" *valid*")
    return null
}

Schema.checkMongoId = (schema, collection) => {
    if (schema.definition.optional && !schema.value) {
        //OLog.debug("schema.js checkMongoId collection="+collection._name+" definition="+OLog.debugString(schema.definition)+" optional field is undefined *bypassed*")
        return null
    }
    if (_.isString(schema.value)) {
        return Schema.checkMongoIdSingle(schema, collection, schema.value)
    }
    else if (_.isArray(schema.value)) {
        //OLog.debug("schema.js checkMongoId collection="+collection._name+" definition="+OLog.debugString(schema.definition)+" *array* of values")
        let result
        schema.value.every(function(element) {
            result = Schema.checkMongoIdSingle(schema, collection, element)
            return result ? false : true
        })
        return result
    }

    OLog.error("schema.js checkMongoId collection=" + collection._name + " definition=" + OLog.errorString(schema.definition) + " unexpected type of value=" + schema.value)
    return "notAllowed"
}

Schema.getAuditUserId = (schema) => {
    if (schema.userId) {
        return schema.userId
    }
    //OLog.debug("schema.js getAuditUserId definition="+OLog.debugString(schema.definition)+" schema.userId="+schema.userId+" returning system ID")
    return Util.getSystemUserId()
}

Schema.checkTenantId = function() {
    return Schema.checkMongoId(this, Tenants)
}

Schema.checkDomainId = function() {
    return Schema.checkMongoId(this, Domains)
}

Schema.checkUserId = function() {
    return Schema.checkMongoId(this, Meteor.users)
}

Schema.checkEventId = function() {
    return Schema.checkMongoId(this, Events)
}

Schema.SubsystemStatus = new SimpleSchema({
    subsystem : {
        type : String
    },
    status : {
        type : String
    },
    date : {
        type : Date
    },
    key : {
        type : String
    },
    variables : {
        type : Object,
        optional : true,
        blackbox : true
    }
})

Schema.Config = new SimpleSchema({
    logLevel : {
        type : Number
    },
    mailmanSleepInterval : {
        type : Number
    }
})

Schema.Tenants = new SimpleSchema({
    dateCreated : {
        type : Date,
        autoValue: function() {
            if ( this.isInsert ) {
                return new Date()
            }
            else if ( this.isUpsert ) {
                return { $setOnInsert: new Date() }
            }
            else if ( this.isSet ) {
                this.unset()
            }
        }
    },
    userCreated : {
        type : String,
        custom: Schema.checkUserId,
        autoValue: function() {
            if ( this.isInsert ) {
                return Schema.getAuditUserId(this)
            }
            else if ( this.isUpsert ) {
                return { $setOnInsert: Schema.getAuditUserId(this) }
            }
            else if ( this.isSet ) {
                this.unset()
            }
        }
    },
    dateModified : {
        type : Date,
        autoValue: function() {
            return new Date()
        }
    },
    userModified : {
        type : String,
        custom: Schema.checkUserId,
        autoValue: function() {
            return Schema.getAuditUserId(this)
        }
    },
    dateRetired : {
        type : Date,
        optional: true
    },
    userRetired : {
        type : String,
        custom: Schema.checkUserId,
        optional: true
    },
    comment : {
        type : String,
        optional : true
    },
    pocUserId : {
        type : String,
        custom: Schema.checkUserId
    },
    functionAnchor : {
        type : String,
        optional : true
    },
    timezone : {
        type : String,
        optional : true
    },
    name : {
        type: String,
        optional: true
    },
    description : {
        type: String,
        optional: true
    },
    officialName : {
        type: String,
        optional: true
    },
    firstName : {
        type: String,
        regEx: CX.REGEX_NAME,
        optional: true
    },
    lastName : {
        type: String,
        regEx: CX.REGEX_NAME,
        optional: true
    },
    iconUrl : {
        type: String,
        regEx: SimpleSchema.RegEx.Url,
        optional: true
    },
    country : {
        type: String,
        allowedValues: Util.getCodes("country"),
        optional: true
    },
    address1 : {
        type: String,
        optional: true
    },
    address2 : {
        type: String,
        optional: true
    },
    city : {
        type: String,
        regEx: CX.REGEX_NAME,
        optional: true
    },
    state : {
        type: String,
        allowedValues: Util.getCodes("state"),
        optional: true
    },
    zip : {
        type: String,
        regEx: CX.REGEX_ZIP_US,
        optional: true
    }
})

Schema.Domains = new SimpleSchema({
    dateCreated : {
        type : Date,
        autoValue: function() {
            if ( this.isInsert ) {
                return new Date()
            }
            else if ( this.isUpsert ) {
                return { $setOnInsert: new Date() }
            }
            else if ( this.isSet ) {
                this.unset()
            }
        }
    },
    userCreated : {
        type : String,
        custom: Schema.checkUserId,
        autoValue: function() {
            if ( this.isInsert ) {
                return Schema.getAuditUserId(this)
            }
            else if ( this.isUpsert ) {
                return { $setOnInsert: Schema.getAuditUserId(this) }
            }
            else if ( this.isSet ) {
                this.unset()
            }
        }
    },
    dateModified : {
        type : Date,
        autoValue: function() {
            return new Date()
        }
    },
    userModified : {
        type : String,
        custom: Schema.checkUserId,
        autoValue: function() {
            return Schema.getAuditUserId(this)
        }
    },
    dateRetired : {
        type : Date,
        optional: true
    },
    userRetired : {
        type : String,
        optional: true
    },
    comment : {
        type : String,
        optional : true
    },
    iconUrl : {
        type : String,
        optional : true
    },
    subsystemStatus : {
        type : [Schema.SubsystemStatus],
        optional : true
    },
    tenant : {
        type : String,
        custom: Schema.checkTenantId
    },
    name : {
        type : String,
        optional: true
    },
    description : {
        type : String,
        optional: true
    },
    billingAddress1 : {
        type : String,
        optional: true
    },
    billingCity : {
        type : String,
        optional: true
    },
    billingState : {
        type : String,
        optional: true
    },
    billingZip : {
        type : String,
        optional: true
    },
    mailgunTest : {
        type : Boolean,
        optional : true
    },
    mailgunDestinationOverride : {
        type : String,
        optional : true
    },
    mailgunPrivateApiKey : {
        type : String,
        optional : true
    },
    mailgunPublicApiKey : {
        type : String,
        optional : true
    },
    mailgunDomain : {
        type : String,
        optional : true
    },
    twilioTest : {
        type : Boolean,
        optional : true
    },
    twilioUser : {
        type : String,
        optional : true
    },
    twilioAuthToken : {
        type : String,
        optional : true
    },
    twilioFromPhone : {
        type : String,
        optional : true
    },
    twilioDestinationOverride : {
        type : String,
        optional : true
    }
})

Schema.Log = new SimpleSchema({
    domain : {
        type : String,
        optional: true
    },
    date : {
        type : Date
    },
    hrtime : {
        type : Number,
        optional: true
    },
    user : {
        type : String,
        optional: true
    },
    severity : {
        type : String
    },
    message : {
        type : String
    },
    server : {
        type : Boolean
    }
})

Schema.Events = new SimpleSchema({
    date : {
        type : Date,
        autoValue: function() {
            if ( this.isInsert ) {
                return new Date()
            }
            else if ( this.isUpsert ) {
                return { $setOnInsert: new Date() }
            }
            else if ( this.isSet ) {
                this.unset()
            }
        }
    },
    domain : {
        type : String,
        custom: Schema.checkDomainId,
        optional: true,
        autoValue: function() {

            var domainId

            if (this.isInsert && !this.isSet) {
                domainId = Util.getCurrentDomainId(this.userId)
                return domainId
            }
        }
    },
    type : {
        type : String,
        allowedValues : Util.getCodes("eventType")
    },
    eventData : {
        type: Object,
        blackbox: true
    }
})

Schema.Notifications = new SimpleSchema({
    date : {
        type : Date,
        autoValue: function() {
            if (this.isInsert && !this.isSet) {
                //OLog.debug("schema.js Notifications date autoValue inferred="+new Date())
                return new Date()
            }
        }
    },
    domain : {
        type : String,
        custom: Schema.checkDomainId,
        optional: true,
        autoValue: function() {

            var domainId

            if (this.isInsert && !this.isSet) {
                domainId = Util.getCurrentDomainId(this.userId)
                //OLog.debug("schema.js Notifications domain autoValue inferred="+domainId)
                return domainId
            }
        }
    },
    type : {
        type : String,
        allowedValues : Util.getCodes("notificationType"),
    },
    icon : {
        type : String
    },
    eventId: {
        type : String,
        custom: Schema.checkEventId,
        optional: true
    },
    eventType: {
        type : String,
        allowedValues : Util.getCodes("eventType"),
        optional : true
    },
    senderId: {
        type : String,
        custom: Schema.checkUserId,
        optional : true
    },
    recipientId: {
        type : String,
        custom: Schema.checkUserId
    },
    key : {
        type: String
    },
    subjectKey : {
        type: String,
        optional: true
    },
    variables : {
        type: Object,
        optional: true,
        blackbox: true
    },
    PNOTIFY_processed : {
        type: Date,
        optional: true
    },
    PNOTIFY_sent : {
        type: Date,
        optional: true
    },
    EMAIL_processed : {
        type: Date,
        optional: true
    },
    EMAIL_sent : {
        type: Date,
        optional: true
    },
    SMS_processed : {
        type: Date,
        optional: true
    },
    SMS_sent : {
        type: Date,
        optional: true
    },
    SMS_delivered : {
        type: Date,
        optional: true
    },
    SMS_read : {
        type: Date,
        optional: true
    },
    SMS_messageStatus : {
        type: String,
        optional: true
    },
    SMS_messageSid : {
        type: String,
        optional: true
    }
})

Schema.Transactions = new SimpleSchema({
    domain : {
        type : String,
        custom : Schema.checkDomainId,
        denyUpdate: true
    },
    userId : {
        type : String,
        custom : Schema.checkUserId,
    },
    collectionName : {
        type : String
    },
    id: {
        type : String
    },
    index : {
        type : Number
    },
    history: {
        type: [Object],
        optional : true,
        blackbox : true
    }
})

Schema.SnapshotCollection = new SimpleSchema({
    collectionName : {
        type : String
    },
    records : {
        type : [Object],
        optional : true,
        blackbox : true
    }
})

Schema.Snapshot = new SimpleSchema({
    userId : {
        type : String,
        custom: Schema.checkUserId,
        autoValue: function() {
            if ( this.isInsert ) {
                return Schema.getAuditUserId(this)
            }
            else if ( this.isUpsert ) {
                return { $setOnInsert: Schema.getAuditUserId(this) }
            }
            else if ( this.isSet ) {
                this.unset()
            }
        }
    },
    date : {
        type : Date,
        autoValue: function() {
            if ( this.isInsert ) {
                return new Date()
            }
            else if ( this.isUpsert ) {
                return { $setOnInsert: new Date() }
            }
            else if ( this.isSet ) {
                this.unset()
            }
        }
    },
    sourceDomain : {
        type : String,
        custom : Schema.checkDomainId,
    },
    targetDomain : {
        type : String,
        custom : Schema.checkDomainId,
    },
    collections : {
        type : [Schema.SnapshotCollection],
        optional : true
    }
})

Schema.History = new SimpleSchema({
    domain : {
        type : String,
        custom : Schema.checkDomainId
    },
    snapshots : {
        type : [Schema.Snapshot],
        optional : true
    }
})

Schema.Clipboard = new SimpleSchema({
    userId : {
        type : String,
        custom: Schema.checkUserId,
        autoValue: function() {
            if ( this.isInsert ) {
                return Schema.getAuditUserId(this)
            }
            else if ( this.isUpsert ) {
                return { $setOnInsert: Schema.getAuditUserId(this) }
            }
            else if ( this.isSet ) {
                this.unset()
            }
        }
    },
    date : {
        type : Date,
        autoValue: function() {
            if ( this.isInsert ) {
                return new Date()
            }
            else if ( this.isUpsert ) {
                return { $setOnInsert: new Date() }
            }
            else if ( this.isSet ) {
                this.unset()
            }
        }
    },
    clipboardType : {
        type : String
    },
    payload : {
        type : Object,
        optional : true,
        blackbox : true
    }
})

Schema.UserProfileTenants = new SimpleSchema({
    tenantId : {
        type : String,
        custom: Schema.checkTenantId
    },
    roles : {
        type : [String],
        allowedValues : Util.getCodes("userRole", { tenantRole : true }),
    }
})

Schema.UserProfileDomains = new SimpleSchema({
    domainId : {
        type : String,
        custom: Schema.checkDomainId
    },
    roles : {
        type : [String],
        allowedValues : Util.getCodes("userRole", { tenantRole : false }),
    }
})

Schema.UserProfile = new SimpleSchema({
    dateCreated : {
        type : Date,
        autoValue: function() {
            if ( this.isInsert ) {
                return new Date()
            }
            else if ( this.isUpsert ) {
                return { $setOnInsert: new Date() }
            }
            else if ( this.isSet ) {
                this.unset()
            }
        }
    },
    userCreated : {
        type : String,
        custom: Schema.checkUserId,
        autoValue: function() {
            if ( this.isInsert ) {
                return Schema.getAuditUserId(this)
            }
            else if ( this.isUpsert ) {
                return { $setOnInsert: Schema.getAuditUserId(this) }
            }
            else if ( this.isSet ) {
                this.unset()
            }
        }
    },
    dateModified : {
        type : Date,
        autoValue: function() {
            return new Date()
        }
    },
    userModified : {
        type : String,
        custom: Schema.checkUserId,
        autoValue: function() {
            return Schema.getAuditUserId(this)
        }
    },
    dateRetired : {
        type : Date,
        optional: true
    },
    userRetired : {
        type : String,
        optional: true
    },
    enrolled: {
        type : Boolean,
        optional : true
    },
    comment : {
        type: String,
        optional : true
    },
    source : {
        type : String,
        optional : true
    },
    clientVersion : {
        type : String,
        optional : true
    },
    logLevel : {
        type : Number,
        optional : true
    },
    timezone : {
        type : String,
        optional : true,
        allowedValues : moment.tz.names()
    },
    tenants : {
        type : [Schema.UserProfileTenants]
    },
    domains : {
        type : [Schema.UserProfileDomains]
    },
    currentDomain: {
        type: String,
        optional : true,
        custom: Schema.checkDomainId
    },
    firstName : {
        type : String,
        optional : true,
        regEx: CX.REGEX_NAME
    },
    middleName : {
        type : String,
        optional : true,
        regEx: CX.REGEX_NAME
    },
    lastName : {
        type : String,
        optional : true,
        regEx: CX.REGEX_NAME
    },
    address1 : {
        type : String,
        optional : true
    },
    address2 : {
        type : String,
        optional : true
    },
    city : {
        type : String,
        optional : true,
        regEx: CX.REGEX_NAME
    },
    state : {
        type : String,
        optional : true
    },
    zip: {
        type : String,
        optional : true
    },
    country: {
        type : String,
        optional : true,
        allowedValues : Util.getCodes("country")
    },
    phone: {
        type : String,
        optional : true
    },
    mobile: {
        type : String,
        optional : true
    },
    locale : {
        type : String,
        optional : true
    },
    photoUrl : {
        type : String,
        optional : true,
        regEx: SimpleSchema.RegEx.Url
    },
    notificationPreferences : {
        type : [Object],
        optional : true,
        blackbox : true
    },
    standardPreferences : {
        type : [Object],
        optional : true,
        blackbox : true
    },
    reportPreferences : {
        type : [Object],
        optional : true,
        blackbox : true
    }
})

Schema.UserStatusLastLogin = new SimpleSchema({
    date: {
        type: Date,
        optional: true
    },
    ipAddr: {
        type: String,
        optional: true,
        regEx: SimpleSchema.RegEx.IP
    },
    userAgent: {
        type: String,
        optional: true
    }
});

Schema.UserStatus = new SimpleSchema({
    online: {
        type: Boolean,
        optional: true
    },
    lastLogin: {
        type: Schema.UserStatusLastLogin,
        optional: true
    },
    idle: {
        type: Boolean,
        optional: true
    },
    lastActivity: {
        type: Date,
        optional: true
    },
});

Schema.Users = new SimpleSchema({
    username : {
        type : String,
        optional : true
    },
    emails : {
        type : Array,
        optional : true
    },
    "emails.$" : {
        type : Object
    },
    "emails.$.address" : {
        type : String
        // Note no Regex here because during initial user creation we have a bogus address UUID
    },
    "emails.$.verified" : {
        type : Boolean
    },
    createdAt : {
        type : Date
    },
    profile : {
        type : Schema.UserProfile,
        optional : true
    },
    // Make sure this services field is in your schema if you're using any of the accounts packages
    services : {
        type : Object,
        optional : true,
        blackbox : true
    },
    status: {
        type: Schema.UserStatus,
        optional: true
    }
})

Schema.Templates = new SimpleSchema({
    dateCreated : {
        type : Date,
        autoValue: function() {
            if (this.isInsert && !this.isSet) {
                return new Date();
            }
        }
    },
    userCreated : {
        type : String,
        custom: Schema.checkUserId,
        autoValue: function() {
            if (this.isInsert && !this.isSet) {
                return Schema.getAuditUserId(this);
            }
        }
    },
    dateModified : {
        type : Date,
        autoValue: function() {
            return new Date();
        }
    },
    userModified : {
        type : String,
        custom: Schema.checkUserId,
        autoValue: function() {
            return Schema.getAuditUserId(this);
        }
    },
    dateRetired : {
        type : Date,
        optional: true
    },
    userRetired : {
        type : String,
        custom: Schema.checkUserId,
        optional: true
    },
    comment : {
        type : String,
        optional: true
    },
    domain : {
        type : String,
        custom: Schema.checkDomainId,
        autoValue : function() {
            if (this.isInsert && !this.isSet) {
                return Util.getCurrentDomainId(this.userId);
            }
        }
    },
    subsystemStatus : {
        type : [Schema.SubsystemStatus],
        optional : true
    },
    name : {
        type : String,
        optional : true
    },
    description : {
        type : String,
        optional : true
    },
    subject : {
        type : String,
        optional : true
    },
    html : {
        type : String,
        optional : true
    }
})

Schema.Functions = new SimpleSchema({
    dateCreated : {
        type : Date,
        autoValue: function() {
            if ( this.isInsert ) {
                return new Date()
            }
            else if ( this.isUpsert ) {
                return { $setOnInsert: new Date() }
            }
            else if ( this.isSet ) {
                this.unset()
            }
        }
    },
    userCreated : {
        type : String,
        custom: Schema.checkUserId,
        autoValue: function() {
            if ( this.isInsert ) {
                return Schema.getAuditUserId(this)
            }
            else if ( this.isUpsert ) {
                return { $setOnInsert: Schema.getAuditUserId(this) }
            }
            else if ( this.isSet ) {
                this.unset()
            }
        }
    },
    dateModified : {
        type : Date,
        autoValue: function() {
            return new Date()
        }
    },
    userModified : {
        type : String,
        custom: Schema.checkUserId,
        autoValue: function() {
            return Schema.getAuditUserId(this)
        }
    },
    dateRetired : {
        type : Date,
        optional: true
    },
    userRetired : {
        type : String,
        custom: Schema.checkUserId,
        optional: true
    },
    comment : {
        type : String,
        optional : true
    },
    domain : {
        type : String,
        custom: Schema.checkDomainId,
        denyUpdate: true,
        autoValue : function() {
            if (this.isInsert && !this.isSet) {
                return Util.getCurrentDomainId(this.userId);
            }
        }
    },
    name : {
        type: String,
        optional: true
    },
    description : {
        type: String,
        optional: true
    },
    functionType : {
        type: String,
        optional: true
    },
    value : {
        type: String,
        optional: true
    }
})

Schema.DaemonJobs = new SimpleSchema({
    jobName : {
        type: String
    },
    timeInterval : {
        type: Number
    },
    timeUnit : {
        type: String
    },
    timeOption : {
        type: String,
        optional : true
    },
    timezone : {
        type: String,
        optional : true
    },
    initFunctionName : {
        type: String,
        optional : true
    },
    execFunctionName : {
        type: String,
        optional : true
    },
    lastDate : {
        type: Date,
        optional : true,
    },
    nextDate : {
        type: Date,
        optional : true
    },
    running : {
        type : Boolean,
        optional : true
    }
})

Schema.UploadStats = new SimpleSchema({
    date : {
        type : Date,
        autoValue: function() {
            return new Date();
        }
    },
    domain : {
        type : String,
        custom: Schema.checkDomainId,
        autoValue : function() {
            if (this.isInsert && !this.isSet) {
                return Util.getCurrentDomainId(this.userId);
            }
        }
    },
    uploadType : {
        type : String,
        allowedValues : Util.getCodes("uploadType")
    },
    uploadParameters : {
        type : Object,
        blackbox : true,
        optional : true
    },
    status : {
        type : String,
        allowedValues : Util.getCodes("uploadStatus")
    },
    userId : {
        type : String,
        optional : true
    },
    originalFileName : {
        type : String,
        optional : true
    },
    totalSize : {
        type : Number,
        optional : true
    },
    filePath : {
        type : String,
        optional : true
    },
    processed : {
        type : Number,
        optional : true
    },
    total : {
        type : Number,
        optional: true
    },
    stop : {
        type: Boolean,
        optional: true
    },
    messages : {
        type : [Object],
        blackbox : true,
        optional : true
    }
})


// Attach schemas to activate:
Config.attachSchema(Schema.Config)
Domains.attachSchema(Schema.Domains)
Meteor.users.attachSchema(Schema.Users)

Log.attachSchema(Schema.Log)
Events.attachSchema(Schema.Events)
Notifications.attachSchema(Schema.Notifications)
Transactions.attachSchema(Schema.Transactions)
History.attachSchema(Schema.History)
Clipboard.attachSchema(Schema.Clipboard)
Templates.attachSchema(Schema.Templates)
Functions.attachSchema(Schema.Functions)
DaemonJobs.attachSchema(Schema.DaemonJobs)
UploadStats.attachSchema(Schema.UploadStats)
