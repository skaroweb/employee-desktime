/*! firebase-admin v11.9.0 */
"use strict";
/*!
 * @license
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTopic = exports.isURL = exports.isUTCDateString = exports.isISODateString = exports.isPhoneNumber = exports.isEmail = exports.isPassword = exports.isUid = exports.isNonNullObject = exports.isObject = exports.isNonEmptyString = exports.isBase64String = exports.isString = exports.isNumber = exports.isBoolean = exports.isNonEmptyArray = exports.isArray = exports.isBuffer = void 0;
const url = require("url");
/**
 * Validates that a value is a byte buffer.
 *
 * @param value - The value to validate.
 * @returns Whether the value is byte buffer or not.
 */
function isBuffer(value) {
    return value instanceof Buffer;
}
exports.isBuffer = isBuffer;
/**
 * Validates that a value is an array.
 *
 * @param value - The value to validate.
 * @returns Whether the value is an array or not.
 */
function isArray(value) {
    return Array.isArray(value);
}
exports.isArray = isArray;
/**
 * Validates that a value is a non-empty array.
 *
 * @param value - The value to validate.
 * @returns Whether the value is a non-empty array or not.
 */
function isNonEmptyArray(value) {
    return isArray(value) && value.length !== 0;
}
exports.isNonEmptyArray = isNonEmptyArray;
/**
 * Validates that a value is a boolean.
 *
 * @param value - The value to validate.
 * @returns Whether the value is a boolean or not.
 */
function isBoolean(value) {
    return typeof value === 'boolean';
}
exports.isBoolean = isBoolean;
/**
 * Validates that a value is a number.
 *
 * @param value - The value to validate.
 * @returns Whether the value is a number or not.
 */
function isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
}
exports.isNumber = isNumber;
/**
 * Validates that a value is a string.
 *
 * @param value - The value to validate.
 * @returns Whether the value is a string or not.
 */
function isString(value) {
    return typeof value === 'string';
}
exports.isString = isString;
/**
 * Validates that a value is a base64 string.
 *
 * @param value - The value to validate.
 * @returns Whether the value is a base64 string or not.
 */
function isBase64String(value) {
    if (!isString(value)) {
        return false;
    }
    return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value);
}
exports.isBase64String = isBase64String;
/**
 * Validates that a value is a non-empty string.
 *
 * @param value - The value to validate.
 * @returns Whether the value is a non-empty string or not.
 */
function isNonEmptyString(value) {
    return isString(value) && value !== '';
}
exports.isNonEmptyString = isNonEmptyString;
/**
 * Validates that a value is a nullable object.
 *
 * @param value - The value to validate.
 * @returns Whether the value is an object or not.
 */
function isObject(value) {
    return typeof value === 'object' && !isArray(value);
}
exports.isObject = isObject;
/**
 * Validates that a value is a non-null object.
 *
 * @param value - The value to validate.
 * @returns Whether the value is a non-null object or not.
 */
function isNonNullObject(value) {
    return isObject(value) && value !== null;
}
exports.isNonNullObject = isNonNullObject;
/**
 * Validates that a string is a valid Firebase Auth uid.
 *
 * @param uid - The string to validate.
 * @returns Whether the string is a valid Firebase Auth uid.
 */
function isUid(uid) {
    return typeof uid === 'string' && uid.length > 0 && uid.length <= 128;
}
exports.isUid = isUid;
/**
 * Validates that a string is a valid Firebase Auth password.
 *
 * @param password - The password string to validate.
 * @returns Whether the string is a valid Firebase Auth password.
 */
function isPassword(password) {
    // A password must be a string of at least 6 characters.
    return typeof password === 'string' && password.length >= 6;
}
exports.isPassword = isPassword;
/**
 * Validates that a string is a valid email.
 *
 * @param email - The string to validate.
 * @returns Whether the string is valid email or not.
 */
function isEmail(email) {
    if (typeof email !== 'string') {
        return false;
    }
    // There must at least one character before the @ symbol and another after.
    const re = /^[^@]+@[^@]+$/;
    return re.test(email);
}
exports.isEmail = isEmail;
/**
 * Validates that a string is a valid phone number.
 *
 * @param phoneNumber - The string to validate.
 * @returns Whether the string is a valid phone number or not.
 */
function isPhoneNumber(phoneNumber) {
    if (typeof phoneNumber !== 'string') {
        return false;
    }
    // Phone number validation is very lax here. Backend will enforce E.164
    // spec compliance and will normalize accordingly.
    // The phone number string must be non-empty and starts with a plus sign.
    const re1 = /^\+/;
    // The phone number string must contain at least one alphanumeric character.
    const re2 = /[\da-zA-Z]+/;
    return re1.test(phoneNumber) && re2.test(phoneNumber);
}
exports.isPhoneNumber = isPhoneNumber;
/**
 * Validates that a string is a valid ISO date string.
 *
 * @param dateString - The string to validate.
 * @returns Whether the string is a valid ISO date string.
 */
function isISODateString(dateString) {
    try {
        return isNonEmptyString(dateString) &&
            (new Date(dateString).toISOString() === dateString);
    }
    catch (e) {
        return false;
    }
}
exports.isISODateString = isISODateString;
/**
 * Validates that a string is a valid UTC date string.
 *
 * @param dateString - The string to validate.
 * @returns Whether the string is a valid UTC date string.
 */
function isUTCDateString(dateString) {
    try {
        return isNonEmptyString(dateString) &&
            (new Date(dateString).toUTCString() === dateString);
    }
    catch (e) {
        return false;
    }
}
exports.isUTCDateString = isUTCDateString;
/**
 * Validates that a string is a valid web URL.
 *
 * @param urlStr - The string to validate.
 * @returns Whether the string is valid web URL or not.
 */
function isURL(urlStr) {
    if (typeof urlStr !== 'string') {
        return false;
    }
    // Lookup illegal characters.
    const re = /[^a-z0-9:/?#[\]@!$&'()*+,;=.\-_~%]/i;
    if (re.test(urlStr)) {
        return false;
    }
    try {
        const uri = url.parse(urlStr);
        const scheme = uri.protocol;
        const slashes = uri.slashes;
        const hostname = uri.hostname;
        const pathname = uri.pathname;
        if ((scheme !== 'http:' && scheme !== 'https:') || !slashes) {
            return false;
        }
        // Validate hostname: Can contain letters, numbers, underscore and dashes separated by a dot.
        // Each zone must not start with a hyphen or underscore.
        if (!hostname || !/^[a-zA-Z0-9]+[\w-]*([.]?[a-zA-Z0-9]+[\w-]*)*$/.test(hostname)) {
            return false;
        }
        // Allow for pathnames: (/chars+)*/?
        // Where chars can be a combination of: a-z A-Z 0-9 - _ . ~ ! $ & ' ( ) * + , ; = : @ %
        const pathnameRe = /^(\/[\w\-.~!$'()*+,;=:@%]+)*\/?$/;
        // Validate pathname.
        if (pathname &&
            pathname !== '/' &&
            !pathnameRe.test(pathname)) {
            return false;
        }
        // Allow any query string and hash as long as no invalid character is used.
    }
    catch (e) {
        return false;
    }
    return true;
}
exports.isURL = isURL;
/**
 * Validates that the provided topic is a valid FCM topic name.
 *
 * @param topic - The topic to validate.
 * @returns Whether the provided topic is a valid FCM topic name.
 */
function isTopic(topic) {
    if (typeof topic !== 'string') {
        return false;
    }
    const VALID_TOPIC_REGEX = /^(\/topics\/)?(private\/)?[a-zA-Z0-9-_.~%]+$/;
    return VALID_TOPIC_REGEX.test(topic);
}
exports.isTopic = isTopic;
