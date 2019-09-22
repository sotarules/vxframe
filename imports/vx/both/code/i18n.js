"use strict";

Meteor.i18nMessages.common = {

    label_date_undefined : {
        en : "Undefined",
        rx : "$Undefined$"
    },

    label_all : {
        en : "All",
        rx : "$All$"
    },

    label_none : {
        en : "None",
        rx : "$None$"
    },

    label_notify : {
        en : "*notify*",
        rx : "$*notify*$"
    },

    label_variable_undefined : {
        en : "Undefined",
        rx : "$Undefined$"
    },

    label_version_text : {
        en : "Version ({{version}})",
        rx : "$Version ({{version}})$"
    },

    label_under_construction : {
        en : "This this feature is under construction and is not yet available",
        rx : "This this feature is under construction and is not yet available$"
    },

    label_search_ellipsis : {
        en : "Search...",
        rx : "$Search..."
    },

    label_from : {
        en : "From",
        rx : "$From$"
    },

    label_to : {
        en : "To",
        rx : "$To$"
    },

    label_retire_user : {
        en : "Retire User",
        rx : "$Retire User$"
    },

    label_retire_tenant : {
        en : "Retire Tenant",
        rx : "$Retire Tenant$"
    },

    label_retire_domain : {
        en : "Retire Domain",
        rx : "$Retire Domain$"
    },

    label_retire_template : {
        en : "Retire Template",
        rx : "$Retire Template$"
    },

    label_enter_comment : {
        en : "Enter Comment (optional)",
        rx : "$Enter Comment (optional)$"
    },

    button_make_current_domain : {
        en : "Make<br>Current",
        rx : "$Make<br>Current$"
    },

    invalid_date : {
        en : "Invalid date",
        rx : "$Invalid date$"
    },

    invalid_integer : {
        en : "Invalid number",
        rx : "$Invalid number$"
    },

    invalid_float : {
        en : "Invalid decimal number",
        rx : "$Invalid decimal number$"
    },

    invalid_country : {
        en : "Country is not valid.",
        rx : "$Country is not valid.$"
    },

    invalid_locale : {
        en : "Language is not valid.",
        rx : "$Language is not valid.$"
    },

    invalid_firstName : {
        en : "First name is not valid.",
        rx : "$First name is not valid.$"
    },

    invalid_middleName : {
        en : "Middle name or initial is not valid.",
        rx : "$Middle name or initial is not valid.$"
    },

    invalid_lastName : {
        en : "Last name is not valid.",
        rx : "$Last name is not valid.$"
    },

    invalid_address1 : {
        en : "Address is not valid.",
        rx : "$Address is not valid.$"
    },

    invalid_address2 : {
        en : "Address is not valid.",
        rx : "$Address is not valid.$"
    },

    invalid_city : {
        en : "City is not valid.",
        rx : "$City is not valid.$"
    },

    invalid_state : {
        en : "State is not valid.",
        rx : "$State is not valid.$"
    },

    invalid_zip : {
        en : "Zip code is not valid.",
        rx : "$Zip code is not valid.$"
    },

    invalid_phone : {
        en : "Phone number is not valid.",
        rx : "$Phone number is not valid.$"
    },

    invalid_mobile : {
        en : "Mobile number is not valid.",
        rx : "$Mobile number is not valid.$"
    },

    invalid_email : {
        en : "Invalid email address",
        rx : "$Invalid email address$"
    },

    invalid_credit_card_number : {
        en : "Invalid card number, must consist only of digits 0-9 (may contain separator spaces which will be ignored)",
        rx : "$Invalid card number, must consist only of digits 0-9 (may contain separator spaces which will be ignored)$"
    },

    invalid_expiration_date : {
        en : "Invalid card expiration date, must be four digits (MMYY) month 01-12 and year 00-99 (may contain separator spaces which will be ignored)",
        rx : "$Invalid card expiration date, must be four digits (MMYY) month 01-12 and year 00-99 (may contain separator spaces which will be ignored)$"
    },

    invalid_cvv : {
        en : "Invalid card verification number (CVV) must be three digits 000-999",
        rx : "$Invalid card verification number (CVV) must be three digits 000-999$"
    },

    invalid_ip_address : {
        en : "Invalid IP address (must be four numbers separated by periods)",
        rx : "$Invalid IP address (must be four numbers separated by periods)$"
    },

    invalid_balance : {
        en : "Invalid balance (must be an integer or decimal number)",
        rx : "$Invalid balance (must be an integer or decimal number)$"
    },

    invalid_money : {
        en : "Invalid currency amount (must be an integer or decimal number)",
        rx : "$Invalid currency amount (must be an integer or decimal number)$"
    },

    invalid_url: {
        en : "URL is not valid.",
        rx : "$URL is not valid.$"
    },

    option_none : {
        en : "",
        rx : "$$"
    },

    value_default_domain_name : {
        en : "Base Domain",
        rx : "$Base Domain$"
    },

    value_default_domain_description : {
        en : "Base Domain",
        rx : "$Base Domain$"
    },

    value_default_domain_name_with_tenant : {
        en : "{{tenantName}} Base Domain",
        rx : "${{tenantName}} Base Domain$"
    },

    value_default_domain_description_with_tenant : {
        en : "{{tenantName}} base domain",
        rx : "${{tenantName}} base domain$"
    },

    alert_generic : {
        en : "{{genericMessage}}",
        rx : "${{genericMessage}}$",
    },

    alert_generic_subject : {
        en : "{{genericSubject}}",
        rx : "${{genericSubject}}$",
    },

    alert_transaction_success : {
        en : "Transaction completed successfully",
        rx : "$Transaction completed successfully$"
    },

    alert_transaction_fail : {
        en : "Transaction failed",
        rx : "$Transaction failed$"
    },

    alert_unexpected_error : {
        en : "{{error}}",
        rx : "${{error}}$"
    },

    alert_unexpected_error_logged : {
        en : "Unexpected error occurred, please consult the log file for details.",
        rx : "$Unexpected error occurred, please consult the log file for details.$"
    },

    alert_bad_url : {
        en : "Unexpected error: URL has missing or incorrect parameters, consult log for details.",
        rx : "$Unexpected error: URL has missing or incorrect parameters, consult log for details.$"
    },

    alert_bad_parameters : {
        en : "Unexpected error: bad parameter(s) were passed to a domain function, consult log for details.",
        rx : "$Unexpected error: bad parameter(s) were passed to a domain function, consult log for details.$"
    },

    alert_security_check_failed : {
        en : "{{system_name}} security has prevented this transaction.",
        rx : "${{system_name}} security has prevented this transaction.$"
    },

    alert_parameter_check_failed : {
        en : "{{system_name}} parameter type checking prevented this transaction.",
        rx : "${{system_name}} parameter type checking prevented this transaction.$"
    },

    alert_database_modification_check_failed : {
        en : "{{system_name}} database modification checking prevented this transaction.",
        rx : "${{system_name}} database modification checking prevented this transaction.$"
    },

    alert_schema_validation_failed : {
        en : "{{system_name}} schema validation checking prevented this transaction.",
        rx : "${{system_name}} schema validation checking prevented this transaction.$"
    },

    alert_transaction_fail_tenant_not_found : {
        en : "Transaction failed, tenant not found, tenantId={{tenantId}}",
        rx : "$Transaction failed, tenant not found, tenantId={{tenantId}}$"
    },

    alert_transaction_fail_domain_not_found : {
        en : "Transaction failed, domain not found, domainId={{domainId}}",
        rx : "$Transaction failed, domain not found, domainId={{domainId}}$"
    },

    alert_transaction_fail_domain_not_found_for_user : {
        en : "Transaction failed, domain not found for userId={{userId}}",
        rx : "$Transaction failed, domain not found for userId={{userId}}$"
    },

    alert_transaction_fail_user_not_found : {
        en : "Transaction failed, user not found, userId={{userId}}",
        rx : "$Transaction failed, user not found, userId={{userId}}$"
    },

    alert_transaction_fail_timezone_not_found : {
        en : "Could not determine timezone of current user",
        rx : "$Could not determine timezone of current user$"
    },

    alert_transaction_fail_template_not_found : {
        en : "Transaction failed, template not found, templateId={{templateId}}",
        rx : "$Transaction failed, template not found, templateId={{templateId}}$"
    },

    alert_transaction_fail_undo_transactions_not_found : {
        en : "Undo failed transaction set not found",
        rx : "$Undo failed transaction set not found$"
    },

    alert_transaction_fail_redo_transactions_not_found : {
        en : "Redo failed transaction set not found",
        rx : "$Redo failed transaction set not found$"
    },

    alert_transaction_fail_undo_no_eariler_state : {
        en : "Cannot undo because you're at the beginning of the history",
        rx : "$Cannot undo because you're at the beginning of the history$"
    },

    alert_transaction_fail_redo_no_later_state : {
        en : "Cannot redo because you're at the end of the history",
        rx : "$Cannot redo because you're at the end of the history$"
    },

    alert_transaction_fail_unable_to_update_record_state : {
        en : "Transaction failed unable to update record state",
        rx : "$Transaction failed unable to update record state$"
    },

    alert_transaction_fail_unable_to_update_transaction_history : {
        en : "Transaction failed unable to update transaction history",
        rx : "$Transaction failed unable to update transaction history$"
    },

    alert_transaction_fail_unable_to_update_deployment_history : {
        en : "Transaction failed unable to update deployment history",
        rx : "$Transaction failed unable to update deployment history$"
    },

    alert_transaction_fail_unable_to_copy_record : {
        en : "Transaction failed unable to copy record",
        rx : "$Transaction failed unable to copy record$"
    },

    alert_transaction_fail_unable_to_find_deployment_history : {
        en : "Transaction failed unable to find deployment history of {{targetDomainName}}",
        rx : "$Transaction failed unable to find deployment history of {{targetDomainName}}$"
    },

    alert_report_send_success : {
        en : "{{reportName}} has been sent to {{email}}",
        rx : "${{reportName}} has been sent to {{email}}$"
    },

    alert_password_save_success : {
        en : "Your password has been reset.",
        rx : "$Your password has been reset.$"
    },

    alert_subscriptions_not_ready : {
        en : "Subscriptions are not yet ready.",
        rx : "$Subscriptions are not yet ready.$"
    },

    alert_record_cloned_success : {
        en : "{{name}} has been cloned successfully.",
        rx : "${{name}} has been cloned successfully.$"
    },

    alert_user_retire : {
        en : "\"{{fullName}}\" has been retired.",
        rx : "$\"{{fullName}}\" has been retired.$"
    },

    alert_domain_retire : {
        en : "\"{{domainName}}\" has been retired.",
        rx : "$\"{{domainName}}\" has been retired.$"
    },

    alert_send_enrollment_email_success : {
        en: "Enrollment email was sent to {{email}}",
        rx: "$Enrollment email was sent to {{email}}$"
    },

    alert_send_enrollment_email_error : {
        en : "An unexpected error occurred when the system tried to send enrollment email: {{error}}",
        rx : "$An unexpected error occurred when the system tried to send enrollment email: {{error}}$"
    },

    alert_send_reset_password_email_success : {
        en: "Reset password email was sent to {{userFullName}}",
        rx: "$Reset password email was sent to {{userFullName}}$"
    },

    alert_send_reset_password_email_error : {
        en : "An unexpected error occurred when the system tried to send reset password email: {{error}}",
        rx : "$An unexpected error occurred when the system tried to send reset password email: {{error}}$"
    },

    alert_tenant_create: {
        en : "{{adminName}} has created a new tenant.",
        rx : "${{adminName}} has created a new tenant.$"
    },

    alert_tenant_retire: {
        en : "{{adminName}} has retired {{tenantName}}",
        rx : "${{adminName}} has retired {{tenantName}}$"
    },

    alert_tenant_retired_successfully: {
        en : "{{tenantName}} has been retired",
        rx : "${{tenantName}} has been retired$"
    },

    alert_domain_changed : {
        en : "Welcome to {{domainName}}",
        rx : "$Welcome to {{domainName}}$"
    },

    alert_save_succeeded : {
        en : "Data has been saved successfully.",
        rx : "$Data has been saved successfully.$"
    },

    alert_password_save_error : {
        en : "Unexpected error occurred while resetting password {{error}}",
        rx : "$Unexpected error occurred while resetting password {{error}}$"
    },

    alert_callback_error : {
        en : "{{error}}",
        rx : "${{error}}$"
    },

    alert_send_test_email_success : {
        en : "Test email has been sent successfully.",
        rx : "$Test email has been sent successfully.$"
    },

    alert_send_test_email_fail : {
        en : "Send email test failed - {{error}}",
        rx : "$Send email test failed - {{error}}$"
    },

    alert_http_unexpected_error : {
        en : "{{error}}",
        rx : "${{error}}$"
    },

    alert_http_no_response_object : {
        en : "Unexpected HTTP problem: no response object",
        rx : "$Unexpected HTTP problem: no response object$"
    },

    alert_http_no_content : {
        en : "Unexpected HTTP problem: no content returned result={{result}}",
        rx : "$Unexpected HTTP problem: no content returned result={{result}}$"
    },

    alert_http_unable_to_parse_content : {
        en : "Unexpected HTTP problem: unable to parse content result={{result}}",
        rx : "$Unexpected HTTP problem: unable to parse content result={{result}}$"
    },

    alert_http_unexpected_http_status_code : {
        en : "Unexpected HTTP status code={{statusCode}}",
        rx : "$Unexpected HTTP status code={{statusCode}}$"
    },

    alert_deployment_copy_success : {
        en : "{{sourceDomainName}} has been copied to {{targetDomainName}}",
        rx : "${{sourceDomainName}} has been copied to {{targetDomainName}}$"
    },

    alert_deployment_restored_success : {
        en : "{{targetDomainName}} has been restored to snapshot taken on {{dateTime}}",
        rx : "${{targetDomainName}} has been restored to snapshot taken on {{dateTime}}$"
    },

    alert_deployment_message_restore : {
        en : "If you press [Confirm] the system will restore all Functions, Wizards, Forms, Composites and Counties into {{targetDomainName}} using data from a snapshot taken on {{dateTime}}.",
        rx : "$If you press [Confirm] the system will restore all Functions, Wizards, Forms, Composites and Counties into {{targetDomainName}} using data from a snapshot taken on {{dateTime}}..$"
    },

    alert_deployment_message_no_history : {
        en : "Cannot restore because {{targetDomainName}} has no copy history",
        rx : "$Cannot restore because {{targetDomainName}} has no copy history$"
    },

    alert_deployment_snapshot_option : {
        en : "{{targetDomainName}} snapshot created {{dateTime}}",
        rx : "${{targetDomainName}} snapshot created {{dateTime}}$"
    },

    alert_deployment_name_missing : {
        en : "Collection {{collectionName}} has a record with no name",
        rx : "$Collection {{collectionName}} has a record with no name$"
    },

    alert_deployment_name_duplicate : {
        en : "Collection {{collectionName}} has more than one record named {{name}}",
        rx : "$Collection {{collectionName}} has more than one record named {{name}}$"
    },

    alert_deployment_name_issues : {
        en : "{{issues}}",
        rx : "${{issues}}$"
    },

    message_loading : {
        en : "Loading",
        rx : "$Loading$"
    },

    mail_subsystem_from : {
        en : "{{system_name}} <{{system_email}}>",
        rx : "${{system_name}}$ <{{system_email}}>"
    },

    mail_subsystem_subject : {
        en : "{{subsystemIdentifier}} Status Changed to {{subsystemStatus}}",
        rx : "${{subsystemIdentifier}} Status Changed to {{subsystemStatus}}$"
    },

    mail_subsystem_red : {
        en : "{{system_name}} system has detected a problem with {{subsystemIdentifier}} and marked the status {{subsystemStatus}}.\n\n" +
        "Message from subsystem monitor: \"{{message}}\"",
        rx : "${{system_name}} system has detected a problem with {{subsystemIdentifier}} and marked the status {{subsystemStatus}}.\n\n" +
        "Message from subsystem monitor: \"{{message}}\"$"
    },

    mail_subsystem_green : {
        en : "{{system_name}} system has detected that {{subsystemIdentifier}} is working correctly and has marked the status {{subsystemStatus}}.\n\n" +
        "Message from subsystem monitor: \"{{message}}\"",
        rx : "${{system_name}} system has detected that {{subsystemIdentifier}} is working correctly and has marked the status {{subsystemStatus}}.\n\n" +
        "Message from subsystem monitor: \"{{message}}\"$"
    },

    status_template_green : {
        en : "Template was used in a transaction successfully",
        rx : "$Template was used in a transaction successfully$"
    },

    status_template_test_success : {
        en : "Template was used in a test successfully",
        rx : "$Template was used in a test successfully$"
    },

    status_template_test_fail : {
        en : "Template test failed",
        rx : "$Template test failed$"
    },

    status_mailgun_error : {
        en : "Mailgun error - {{errorString}}",
        rx : "$Mailgun error - {{errorString}}$"
    },

    status_mailgun_green : {
        en : "Mailgun API is functioning properly",
        rx : "$Mailgun API is functioning properly$"
    },

    status_twilio_error : {
        en : "Twilio error - {{errorString}}",
        rx : "$Twilio error - {{errorString}}$"
    },

    status_twilio_api_key_invalid_or_depleted : {
        en : "Twilio API error {{info}}",
        rx : "$Twilio API error {{info}}$"
    },

    status_twilio_green : {
        en : "Twilio API is functioning properly",
        rx : "$Twilio API is functioning properly$"
    },

    status_tpp_error : {
        en : "TPP error - {{errorString}}",
        rx : "$TPP error - {{errorString}}$"
    },
}

