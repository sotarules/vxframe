Meta.UserProfile = {
    firstName : {
        localized: {
            en: "First Name",
            rx: "$First Name$"
        },
        bindingType: "String",
        rule: VX.common.firstName
    },
    middleName : {
        localized: {
            en: "Middle Name",
            rx: "$Middle Name$"
        },
        bindingType: "String",
        rule: VX.common.middleName
    },
    lastName : {
        localized: {
            en: "Last Name",
            rx: "$Last Name$"
        },
        bindingType: "String",
        rule: VX.common.lastName
    },
    address1 : {
        localized: {
            en: "Address 1",
            rx: "$Address 1$"
        },
        bindingType: "String",
        rule: VX.common.address1
    },
    address2 : {
        localized: {
            en: "Address 2",
            rx: "$Address 2$"
        },
        bindingType: "String",
        rule: VX.common.address2
    },
    city : {
        localized: {
            en: "City",
            rx: "$City$"
        },
        bindingType: "String",
        rule: VX.common.city
    },
    state : {
        localized: {
            en: "State",
            rx: "$State$"
        },
        bindingType: "String",
        list: "state"
    },
    zip : {
        localized: {
            en: "Zip",
            rx: "$Zip$"
        },
        bindingType: "String",
        rule: VX.common.zip,
        format: FX.zipUS
    },
    country : {
        localized: {
            en: "Country",
            rx: "$Country$"
        },
        bindingType: "String",
        list: "country"
    },
    phone : {
        localized: {
            en: "Phone Number",
            rx: "$Phone Number$"
        },
        bindingType: "String",
        rule: VX.common.phone,
        format: FX.phoneUS
    },
    mobile : {
        localized: {
            en: "Mobile Number",
            rx: "$Mobile Number$"
        },
        bindingType: "String",
        rule: VX.common.phone,
        format: FX.phoneUS
    },
    locale : {
        localized: {
            en: "Locale",
            rx: "$Locale$"
        },
        bindingType: "String",
        list: "locale"
    },
    timezone : {
        localized: {
            en: "Timezone",
            rx: "$Timezone$"
        },
        codeArrayFunction: Util.makeTimezoneArray
    },
    source: {
        localized: {
            en: "User Source",
            rx: "$User Source$"
        },
        bindingType: "String",
        list: "userSource"
    },
    enrolled : {
        localized: {
            en: "Enrolled",
            rx: "$Enrolled$"
        },
        bindingType: "Boolean"
    },
    superAdmin : {
        localized: {
            en: "Super Administrator",
            rx: "$Super Administrator$"
        },
        bindingType: "Boolean"
    },
    clientVersion : {
        localized: {
            en: "Client Version",
            rx: "$Client Version$"
        },
        bindingType: "String"
    },
    logLevel : {
        localized: {
            en: "Log Level",
            rx: "$Log Level$"
        },
        bindingType: "Number"
    },
    dateCreated: {
        localized: {
            en: "Date Created",
            rx: "$Date Created$"
        },
        bindingType: "Date",
        dateFormat: "MM/DD/YYYY HH:mm:ss"
    },
    userCreated: {
        localized: {
            en: "User Created",
            rx: "$User Created$"
        },
        bindingType: "String",
        lookup: true,
        collection: "users",
        keyPropertyName: "username",
        retiredDatePath: "profile.dateRetired",
        returnProperty: "_id",
        renderFunction: Util.fetchFullName,
        codeArrayFunction: Util.makeUserArray
    },
    dateModified: {
        localized: {
            en: "Date Modified",
            rx: "$Date Modified$"
        },
        bindingType: "Date",
        dateFormat: "MM/DD/YYYY HH:mm:ss"
    },
    userModified: {
        localized: {
            en: "User Modified",
            rx: "$User Modified$"
        },
        bindingType: "String",
        lookup: true,
        collection: "users",
        keyPropertyName: "username",
        retiredDatePath: "profile.dateRetired",
        returnProperty: "_id",
        renderFunction: Util.fetchFullName,
        codeArrayFunction: Util.makeUserArray
    }
}

Meta.USER = {
    username : {
        localized: {
            en: "Username",
            rx: "$Username$"
        },
        bindingType: "String"
    },
    profile : {
        localized: {
            en: "Profile",
            rx: "$Profile$"
        },
        bindingType: "Object",
        definition: Meta.UserProfile
    }
}

