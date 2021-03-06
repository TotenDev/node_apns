//
// apnNotification.js — node_apns
// today is 12/03/12, it is now 06:02 PM
// created by Thierry Passeron
// see LICENSE for details.
//
var Device = require('./apnDevice.js');
    assert = require('assert');

module.exports = function (token,payload) { return new Notification(token,payload); }
var Notification = function (token, payload) {
    if (false === (this instanceof Notification)) { return new Notification(token, payload); }
    //
    this.expiry = 0;
    this.identifier = undefined;
    this.encoding = "utf8";
    //
    if (token) this.device = Device(token);
    //
    var aps = payload["aps"];
    delete payload["aps"];
    if (payload) this.payload = payload;
    // Placeholders
    this.alert = aps["alert"];
    this.badge = aps["badge"];
    this.sound = aps["sound"];
    return this;
};

/* Basic checking of the notification's validity */
Notification.prototype.isValid = function () {
    if (!this.device || !this.device.isValid()) return false;
    var normalized = this.normalizedPayload();
    if (Buffer.byteLength(JSON.stringify(normalized), this.encoding) > 256) return false;
    if (!normalized.aps.alert && !normalized.aps.sound && !normalized.aps.badge) return false;
    return true;
}

Notification.prototype.normalizedPayload = function () {
    var normalized = {};
    // Copy the payload so we don't alter the original notification object
    for (var key in this.payload) {
        if (this.payload.hasOwnProperty(key)) normalized[key] = this.payload[key];
    }
    if (!normalized.aps) normalized.aps = {};
    if (typeof(this.alert) === 'string' && this.alert.length > 0) normalized.aps.alert = this.alert;
    if (typeof(this.sound) === 'string' && this.sound.length > 0) normalized.aps.sound = this.sound;
    if (typeof(this.badge) === 'number' && this.badge.length > 0) normalized.aps.badge = this.badge;
    else if (typeof(this.badge) === 'string' && this.badge.length > 0) normalized.aps.badge = parseInt(this.badge);
    return normalized;
}

Notification.prototype.payloadString = function () { return JSON.stringify(this.normalizedPayload()); }

/* Output the notification in network (binary) format */
Notification.prototype.toNetwork = function (uid) {
    var data = null,
        token = this.device.toNetwork(),
        tokenLength = token.length,
        payloadString = this.payloadString(),
        payloadLength = Buffer.byteLength(payloadString, this.encoding);
    var token_and_payload_size = 2 + tokenLength + 2 + payloadLength;
    if (typeof(uid) !== "undefined") { /* extended notification format */
        this.identifier = uid; // Set the uid in the notification
        data = new Buffer(1 + 4 + 4 + token_and_payload_size);
        data.writeUInt8(1,              0);                                     
        data.writeUInt32BE(uid,         1);                                     
        data.writeUInt32BE(this.expiry, 5); // Apple's doc says it could be negative but the C example uses uint32_t ??!
                                            // Comments ?...
                                            //
                                            // SOURCE: You can specify zero or a value less than zero to request that APNs not store the notification at all.
                                            //
                                            //     /* expiry date network order */
                                            //     memcpy(binaryMessagePt, &networkOrderExpiryEpochUTC, sizeof(uint32_t));

    } else { /* simple notification format */
        data = new Buffer(1 + token_and_payload_size);
        data.writeUInt8(0, 0);
    }

    var token_start_index = data.length - token_and_payload_size;
    data.writeUInt16BE(tokenLength,     token_start_index);
    token.copy(data,                    token_start_index + 2);
    data.writeUInt16BE(payloadLength,   token_start_index + 2 + tokenLength);
    data.write(payloadString,           token_start_index + 2 + tokenLength + 2, payloadLength, this.encoding);
    return data;
}