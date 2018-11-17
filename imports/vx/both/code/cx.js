"use strict"

CX.SYSTEM_NAME = "VXFrame"
CX.SYSTEM_EMAIL = "admin@sotaenterprises.com"

CX.CLOUDFILES_PREFIX = "https://s3-us-west-1.amazonaws.com/vxframe"
CX.CLOUDFILES_IMAGE = CX.CLOUDFILES_PREFIX + "/img/system"

CX.REGEX_EMAIL_FORMAT = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
CX.REGEX_NAME = /^[a-zA-ZàáâäãåąćęèéêëìíîïłńòóôöõøùúûüÿýżźñçčšžÀÁÂÄÃÅĄĆĘÈÉÊËÌÍÎÏŁŃÒÓÔÖÕØÙÚÛÜŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/
CX.REGEX_ZIP_US =  /(^\d{5}$)|(^\d{5}-\d{4}$)/
CX.REGEX_PHONE_US = /^\d{10}$/
CX.REGEX_NUMERIC_STRIP1 = /[^0-9]/g
CX.REGEX_NUMERIC_STRIP2 = ""
CX.REGEX_DECIMAL_STRIP1 = /[^0-9.]/g
CX.REGEX_DECIMAL_STRIP2 = ""
CX.REGEX_INTEGER = /^\d+$/
CX.REGEX_FLOAT = /^-?\d+\.?\d*$/
CX.REGEX_PHONE_RENDER1 = /(\d{3})(\d{3})(\d{4})/
CX.REGEX_PHONE_RENDER2 = "($1) $2-$3"
CX.REGEX_PIN = /^([0-9]{4})?$/
CX.REGEX_URL = /(http|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp:\/~+#-]*[\w@?^=%&amp\/~+#-])?/

CX.URL_IMAGE_PREFIX = "img"

CX.IMAGE_MIME_EXTENSION_MAP = { "image/gif" : "gif", "image/jpeg" : "jpg", "image/png" : "png" }

CX.USER_LIMITED_FIELDS = { "profile.dateModified": 0, "profile.userModified" : 0, "status" : 0 }
