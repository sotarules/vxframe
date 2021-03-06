CX.SYSTEM_NAME = "VXFrame"
CX.SYSTEM_URL = "https://app.vxframe.com"
CX.SYSTEM_EMAIL = "admin@sotaenterprises.com"

CX.LOCAL_STORAGE_TWO_FACTOR_HASH_KEY = "VXFrame.twoFactorHash"
CX.LOCAL_STORAGE_TWO_FACTOR_HASH_TTL = 30 * 24 * 60 * 60 * 1000

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
CX.REGEX_WHOLE_NUMBER = /^\d+$/
CX.REGEX_INTEGER = /^[-]?\d*$/
CX.REGEX_POSITIVE = /^[1-9][0-9]*$/
CX.REGEX_FLOAT = /^-?\d+\.?\d*$/
CX.REGEX_PHONE_RENDER1 = /(\d{3})(\d{3})(\d{4})/
CX.REGEX_PHONE_RENDER2 = "($1) $2-$3"
CX.REGEX_PIN = /^([0-9]{4})?$/
CX.REGEX_URL = /(http|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp:\/~+#-]*[\w@?^=%&amp\/~+#-])?/
CX.REGEX_TOKEN = /^\d{6}$/

CX.URL_IMAGE_PREFIX = "img"
CX.IMAGE_MIME_EXTENSION_MAP = { "image/gif" : "gif", "image/jpeg" : "jpg", "image/png" : "png" }
CX.USER_LIMITED_FIELDS = { "profile.dateModified": 0, "profile.userModified" : 0, "status" : 0 }
