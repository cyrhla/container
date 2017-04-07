/**
 * @package @cyrhla/container
 * @license MIT
 * @copyright Krystian Pietruszka <kpietru@cyrhla.com>
 * @see http://www.cyrhla.com
 */

'use strict'

const path                         = require('path')
const EventEmitter                 = require('events')
const is                           = require('@cyrhla/tester/is')
const type                         = require('@cyrhla/tester/type')
const valid                        = require('@cyrhla/tester/valid')
const LazyBag                      = require('@cyrhla/container/Bag/LazyBag')
const ServiceBag                   = require('@cyrhla/container/Bag/ServiceBag')
const ListenerBag                  = require('@cyrhla/container/Bag/ListenerBag')
const ServiceInvalidTypeError      = require('@cyrhla/container/Error/ServiceInvalidTypeError')
const ReplaceValueInvalidTypeError = require('@cyrhla/container/Error/ReplaceValueInvalidTypeError')
const PublicInvalidTypeError       = require('@cyrhla/container/Error/PublicInvalidTypeError')
const AliasInvalidTypeError        = require('@cyrhla/container/Error/AliasInvalidTypeError')
const AliasOverflowError           = require('@cyrhla/container/Error/AliasOverflowError')
const KeyReferenceError            = require('@cyrhla/container/Error/KeyReferenceError')
const AliasKeyReferenceError       = require('@cyrhla/container/Error/AliasKeyReferenceError')
const MethodReferenceError         = require('@cyrhla/container/Error/MethodReferenceError')

/**
 * The Container is a simple key/value map for dependency injection (DI).
 * Supports aliases, references to keys (%some.key%) and lazy compilation.
 *
 * Predefined prefixes for keys: "parameters.", "services.", "aliases.",
 * "listeners", "public".
 *
 * !important Why flat keys? The flat keys are faster than the deep keys (20%).
 *
 * @author Krystian Pietruszka <kpietru@cyrhla.com>
 */
module.exports = class Container
{
    /**
     * Initializes this class.
     */
    constructor()
    {
        /** @type string */
        this._parametersPrefix = 'parameters.'

        /** @type string */
        this._servicesPrefix = 'services.'

        /** @type string */
        this._aliasesPrefix = 'aliases.'

        /** @type string */
        this._listenersPrefix = 'listeners.'

        /** @type string */
        this._publicPrefix = 'public.'

        /** @type object */
        this._data = {}

        /** @type EventEmitter[] */
        this._emitters = []
    }

    /**
     * Checks if a key is available.
     *
     * @param string key
     *
     * @return boolean
     */
    has(key)
    {
        valid(key, 'string')

        return (key in this._data)
    }

    /**
     * Sets the key-value pair.
     *
     * This method for "listeners." works as "adder".
     *
     * !important The prefix "public." for viewing only.
     * The implementation of this solution in Container
     * is complicated and meaningless.
     * But you can in classes adapter.
     *
     * @param string key
     * @param mixed  value
     *
     * @throw ServiceInvalidTypeError
     * @throw AliasInvalidTypeError
     * @throw AliasOverflowError
     * @throw PublicInvalidTypeError
     *
     * @return self The invoked object.
     */
    set(key, value)
    {
        valid(key, 'string')
        valid(value, 'mixed')

        if (key.indexOf(this._servicesPrefix) === 0) {
            if (is(value, 'object') && value.constructor.name === 'Object') {
                value = ServiceBag.createFromObject(value)
            }
            if (is(value, ServiceBag)) {
                if (value.getAlias() !== null) {
                    this.set(this._aliasesPrefix + value.getAlias(), key)
                }

                for (let eventName in value.getListeners()) {
                    for (let callBag of value.getListeners()[eventName]) {
                        this.set(this._listenersPrefix + eventName, new ListenerBag(key, callBag))
                    }
                }

                // !important For viewing only.
                // The implementation of this solution in Container
                // is complicated and meaningless.
                // But you can in classes adapter.
                if (!value.isPublic()) {
                    //this.set(this._publicPrefix + key, false)
                    // Faster
                    this._data[this._publicPrefix + key] = false
                }
            } else if (!is(value, 'object')) {
                throw new ServiceInvalidTypeError(
                    '@param value Invalid type ' + type(value) + ', required: object or ServiceBag.'
                )
            }
        } else if (key.indexOf(this._listenersPrefix) === 0) {
            if (is(value, 'object') && value.constructor.name === 'Object') {
                value = ListenerBag.createFromObject(value)
            }

            if ((key in this._data) === false) {
                this._data[key] = []
            }
            var temp = this._data[key]
            temp = is(temp, LazyBag) ? temp.getRaw() : temp
            temp.push(value)
            value = temp

            var self = this
            for (let emitter of this._emitters) {
                emitter.on(key, function() {
                    self.get(key)
                })
            }
        } else if (key.indexOf(this._aliasesPrefix) === 0) {
            if (!is(value, 'string')) {
                throw new AliasInvalidTypeError(
                    '@param value Invalid type ' + type(value) + ', required: string.'
                )
            }
            if (this.has(key)) {
                throw new AliasOverflowError('@param key "' + key + '" already exists.')
            }
        } else if (key.indexOf(this._publicPrefix) === 0) {
            // !important For viewing only.
            // The implementation of this solution in Container
            // is complicated and meaningless.
            // But you can in classes adapter.
            if (!is(value, 'boolean')) {
                throw new PublicInvalidTypeError(
                    '@param value Invalid type ' + type(value) + ', required: boolean.'
                )
            }
        }

        this._data[key] = new LazyBag(value)

        return this
    }

    /**
     * Gets the value in the key-value pair.
     * Supports lazy compilation.
     *
     * @param string key
     *
     * @throw KeyReferenceError
     * @throw AliasKeyReferenceError
     *
     * @return mixed
     */
    get(key)
    {
        valid(key, 'string')

        if (!this.has(key)) {
            throw new KeyReferenceError('@param key "' + key + '" does not exist.')
        }

        var value = this._data[key]

        if (is(value, LazyBag)) {
            value = this._compile(key, value.getRaw())
            this._data[key] = value
        } else if (key.indexOf(this._listenersPrefix) === 0) {
            value = this._callListeners(value, false)
        }

        if (key.indexOf(this._aliasesPrefix) === 0) {
            if (!this.has(value)) {
                throw new AliasKeyReferenceError(
                    '@param key "' + value + '" for "' + key + '" does not exist.'
                )
            }
            this._data[key] = value

            return this.get(value)
        }

        return value
    }

    /**
     * Prepares the container.
     *
     * @param object data
     *
     * @return self The invoked object.
     */
    prepare(data)
    {
        valid(data, 'object')

        for (let key in data) {
            var value = data[key]
            // !important Properties (keys) are strings in JavaScript.
            this.set(key, value)
        }

        return this
    }

    /**
     * Adds the emitter.
     *
     * @param EvantEmitter emitter
     *
     * @return self The invoked object.
     */
    addEmitter(emitter)
    {
        valid(emitter, EventEmitter)

        this._emitters.push(emitter)

        return this
    }

    /**
     * Compiles the values.
     *
     * @param string key
     * @param mixed  value
     *
     * @returns mixed
     */
    _compile(key, value)
    {
        valid(key, 'string')
        valid(value, 'mixed')

        if (key.indexOf(this._servicesPrefix) === 0 && is(value, ServiceBag)) {
            return this._buildClass(value)
        }

        if (key.indexOf(this._listenersPrefix) === 0) {
            return this._callListeners(value)
        }

        if (is(value, 'string')) {
            return this._replaceKeys(value)
        }

        if (is(value, 'array')) {
            return this._replaceKeysRecursive(value)
        }

        if (is(value, 'object')) {
            if (
                value.constructor.name === 'Object' ||
                // If { constructor: function() { ... } } or class constructor { ... }
                value.constructor.name === 'constructor' ||
                // If { constructor: 123 }
                value.constructor.name === undefined
            ) {
                return this._replaceKeysRecursive(value)
            }
        }

        return value
    }

    /**
     * Replaces recursively the keys to values.
     *
     * @param object|array value
     *
     * @return object|array
     */
    _replaceKeysRecursive(value)
    {
        valid(value, 'object', 'array')

        for (let key in value) {
            let val = value[key]
            if (is(val, 'string')) {
                value[key] = this._replaceKeys(val)
            } else if (is(val, 'object', 'array')) {
                // Small problem,
                // without classes but with new constructor() (wrong!)
                // See ContainerTest
                if (
                    val.constructor.name === 'Array' ||
                    val.constructor.name === 'Object' ||
                    // If { constructor: function() { ... } } or class constructor { ... }
                    val.constructor.name === 'constructor' ||
                    // If { constructor: 123 }
                    val.constructor.name === undefined
                ) {
                    value[key] = this._replaceKeysRecursive(val)
                }
            }
        }

        return value
    }

    /**
     * Replaces the keys to values.
     *
     * @param string value
     *
     * @throw ReplaceValueInvalidTypeError
     *
     * @returns mixed
     */
    _replaceKeys(value)
    {
        valid(value, 'string')

        if (value.indexOf('%') === -1) {
            return value
        }

        var matchedKey = value.match(/^%([^%\s]+)%$/)
        if (matchedKey) {
            // Replaces the key in the string,
            // example keys: "%some.key%" or "%?some.key%"
            if (matchedKey[1].indexOf('?') === 0) {
                if (!this.has(matchedKey[1].substr(1))) {
                    value = null
                } else {
                    value = this.get(matchedKey[1].substr(1))
                }
            } else {
                value = this.get(matchedKey[1])
            }

            return value
        }

        var matchedKeys = value.match(/%([^%\s]+)%/g)
        if (matchedKeys) {
            // Replaces the keys in the string,
            // example: "Lorem ipsum %some.key% sit amet, consectetur %some.key% elit."
            for (let key of matchedKeys) {
                key = key.replace(/%/g, '')
                var keyValue = this.get(key)
                if (!is(keyValue, 'string', 'number')) {
                    throw new ReplaceValueInvalidTypeError(
                        '@param keyValue for key "' + key + '" invalid type, '
                        + 'must be a string or number.'
                    )
                }
                value = value.replace(new RegExp('%' + key + '%', 'g'), keyValue + '')
            }
        }

        return value
    }

    /**
     * Builds the class.
     *
     * @param ServiceBag serviceBag
     *
     * @throw MethodReferenceError
     *
     * @return object
     */
    _buildClass(serviceBag)
    {
        valid(serviceBag, ServiceBag)

        var className = this._replaceKeys(serviceBag.getClassName())
        var args = this._replaceKeysRecursive(serviceBag.getArguments())
        var newClass = this._requireClass(className, args)

        var properties = this._replaceKeysRecursive(serviceBag.getProperties())
        for (let key in properties) {
            newClass[key] = properties[key]
        }

        var calls = serviceBag.getCalls()
        for (let callBag of calls) {
            var methodName = this._replaceKeys(callBag.getMethodName())
            var args = this._replaceKeysRecursive(callBag.getArguments())
            if (!is(newClass[methodName], 'function')) {
                throw new MethodReferenceError(
                    'Class "' + className + '" does not have a method "' + methodName + '".'
                )
            }
            newClass[methodName].apply(newClass, args)
        }

        return newClass
    }

    /**
     * Requires the class.
     *
     * @param string  className
     * @param mixed[] args
     *
     * @return object
     */
    _requireClass(className, args)
    {
        valid(className, 'string')
        valid(args, 'array')

        var parts = className.split('.')
        var ext = path.extname(className)

        // See http://nodejs.org/api/modules.html#modules_file_modules
        var requireExtensions = ['.js', '.json', '.node']

        // For require('some').Class
        // or require('some').sub.Class etc.
        if (parts.length > 0 && requireExtensions.indexOf(ext) === -1) {
            var newClass = require(parts[0])
            parts.shift()
            for (let value of parts) {
                newClass = newClass[value]
            }

            return newClass = Reflect.construct(newClass, args)
        }

        return Reflect.construct(require(className), args)
    }

    /**
     * Calls the listeners.
     *
     * @param ListenerBag[] listeners
     * @param boolean       compile   Default true
     *
     * @throw MethodReferenceError
     *
     * @return object
     */
    _callListeners(listeners, compile = true)
    {
        valid(listeners, 'array')
        valid(compile, 'boolean')

        var compiledListeners = []
        for (let listener of listeners) {
            var methodName = listener.getCall().getMethodName()
            var args = listener.getCall().getArguments()

            if (compile === true) {
                methodName = this._replaceKeys(methodName)
                args = this._replaceKeysRecursive(args)
            }

            var key = listener.getKey()
            var newClass = this.get(key)
            if (!is(newClass[methodName], 'function')) {
                throw new MethodReferenceError(
                    'Service "' + key + '" does not have a method "' + methodName + '".'
                )
            }
            newClass[methodName].apply(newClass, args)

            if (compile === true) {
                compiledListeners.push(new ListenerBag(key, methodName, args))
            }
        }

        return compile === true ? compiledListeners : listeners
    }
}

