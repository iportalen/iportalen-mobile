jQuery.extend(jQuery.validator.messages, {
    required: "Dette felt skal udfyldes.",
    remote: "Please fix this field.",
    email: "Indtast venligst en valid e-mail-adresse.",
    url: "Indtast venligst en valid  URL.",
    date: "Indtast venligst en valid dato.",
    dateISO: "Please enter a valid date (ISO).",
    number: "Indtast venligst et validt nummer.",
    digits: "Dette felt må kun indholde tal.",
    creditcard: "Indtast venligst et validt kreditkort nummer.",
    equalTo: "Please enter the same value again.",
    accept: "Please enter a value with a valid extension.",
    maxlength: jQuery.validator.format("Feltet kan maksimalt være på {0} tegn."),
    minlength: jQuery.validator.format("Feltet skal minimum vær på {0} tegn."),
    rangelength: jQuery.validator.format("Feltet skal have en værdi på mellem {0} og {1} tegn."),
    range: jQuery.validator.format("Please enter a value between {0} and {1}."),
    max: jQuery.validator.format("Please enter a value less than or equal to {0}."),
    min: jQuery.validator.format("Please enter a value greater than or equal to {0}.")
});
