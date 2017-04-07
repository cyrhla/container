/**
 * @package @cyrhla/container
 * @license MIT
 * @copyright Krystian Pietruszka <kpietru@cyrhla.com>
 * @see http://www.cyrhla.com
 */

'use strict'

const is                       = require('@cyrhla/tester/is')
const type                     = require('@cyrhla/tester/type')
const valid                    = require('@cyrhla/tester/valid')
const CallBag                  = require('@cyrhla/container/Bag/CallBag')
const ServiceSyntaxError       = require('@cyrhla/container/Error/ServiceSyntaxError')
const ServiceInvalidTypeError  = require('@cyrhla/container/Error/ServiceInvalidTypeError')
const ListenerSyntaxError      = require('@cyrhla/container/Error/ListenerSyntaxError')
const ListenerInvalidTypeError = require('@cyrhla/container/Error/ListenerInvalidTypeError')

/**
 * Bag for service.
 *
 * @author Krystian Pietruszka <kpietru@cyrhla.com>
 */
module.exports = class ServiceBag
{
    /**
     * Initializes this class with the given options.
     *
     * @param string  className
     * @param mixed[] args      Default empty array
     */
    constructor(className, args = [])
    {
        valid(className, 'string')
        valid(args, 'array')

        /** @type string */
        this._className = className

        /** @type mixed[] */
        this._arguments = args

        /** @type null|string */
        this._alias = null

        /** @type object */
        this._properties = {}

        /** @type array[] */
        this._calls = []

        /** @type object */
        this._listeners = {}

        /** @type boolean */
        this._public = true
    }

    /**
     * Gets the className.
     *
     * @return string
     */
    getClassName()
    {
        return this._className
    }

    /**
     * Gets the arguments.
     *
     * @return mixed[]
     */
    getArguments()
    {
        return this._arguments
    }

    /**
     * Sets the alias.
     *
     * @param string alias
     *
     * @return self The invoked object.
     */
    setAlias(alias)
    {
        valid(alias, 'string')

        this._alias = alias

        return this
    }

    /**
     * Gets the alias.
     *
     * @return null|string
     */
    getAlias()
    {
        return this._alias
    }

    /**
     * Sets the property.
     *
     * @param string property
     * @param mixed  value
     *
     * @return self The invoked object.
     */
    setProperty(property, value)
    {
        valid(property, 'string')
        valid(value, 'mixed')

        this._properties[property] = value

        return this
    }

    /**
     * Gets the properties.
     *
     * @return object
     */
    getProperties()
    {
        return this._properties
    }

    /**
     * Adds the method.
     *
     * @param string|CallBag method
     * @param mixed[]        args   Default empty array
     *
     * @return self The invoked object.
     */
    addCall(method, args = [])
    {
        valid(method, CallBag, 'string')
        valid(args, 'array')

        var callBag = is(method, CallBag) ? method : new CallBag(method, args)
        this._calls.push(callBag)

        return this
    }

    /**
     * Gets the methods.
     *
     * @return CallBag[]
     */
    getCalls()
    {
        return this._calls
    }

    /**
     * Adds the listener.
     *
     * @param string         event
     * @param string|CallBag method
     * @param mixed[]        args   Default empty array
     *
     * @return self The invoked object.
     */
    addListener(event, method, args = [])
    {
        valid(event, 'string')
        valid(method, CallBag, 'string')
        valid(args, 'array')

        if ((event in this._listeners) === false) {
            this._listeners[event] = []
        }

        var callBag = is(method, CallBag) ? method : new CallBag(method, args)
        this._listeners[event].push(callBag)

        return this
    }

    /**
     * Gets the listeners.
     *
     * @return object
     */
    getListeners()
    {
        return this._listeners
    }

    /**
     * Sets the public.
     *
     * @param boolean publ
     *
     * @return self The invoked object.
     */
    setPublic(publ)
    {
        valid(publ, 'boolean')

        this._public = publ

        return this
    }

    /**
     * Checks that the service is public.
     *
     * @return boolean
     */
    isPublic()
    {
        return this._public
    }

    /**
     * Creates a new object from the raw data.
     *
     * @param object raw {
     *     @type string   className  Optional but mandatory if no property "class".
     *     @type string   class      Optional but mandatory if no property "className".
     *     @type mixed[]  arguments  Optional
     *     @type string   alias      Optional
     *     @type object   properties Optional
     *     @type array[]  calls      Optional
     *     @type object   listeners  Optional
     *     @type boolean  public     Optional
     * }
     *
     * @throw ServiceSyntaxError
     * @throw ServiceInvalidTypeError
     * @throw ListenerInvalidTypeError
     * @throw ListenerSyntaxError
     *
     * @return self New instance.
     */
    static createFromObject(raw)
    {
        valid(raw, 'object')

        if (('className' in raw) === false) {

            if (('class' in raw) === false) {
                throw new ServiceSyntaxError('@param className or class is not defined.')
            }

            if ('class' in raw) {
                raw.className = raw.class
            }
        }

        if (!is(raw.className, 'string')) {
            throw new ServiceInvalidTypeError(
                '@param raw.className Invalid type ' + type(raw.className) + ', required: string.'
            )
        }

        var args = []
        if ('arguments' in raw) {
            var args = raw.arguments
        }
        var serviceBag = new ServiceBag(raw.className, args)

        if ('properties' in raw) {
            if (!is(raw.properties, 'object')) {
                throw new ServiceInvalidTypeError(
                    '@param raw.properties Invalid type ' + type(raw.properties) + ', required: object.'
                )
            }
            for (let key in raw.properties) {
                serviceBag.setProperty(key, raw.properties[key])
            }
        }

        if ('calls' in raw) {
            if (!is(raw.calls, 'array')) {
                throw new ServiceInvalidTypeError(
                    '@param raw.calls Invalid type ' + type(raw.calls) + ', required: array.'
                )
            }
            for (let value of raw.calls) {
                let methodName = value[0]
                let args = value[1]
                serviceBag.addCall(methodName, args)
            }
        }

        if ('listeners' in raw) {
            if (!is(raw.listeners, 'object')) {
                throw new ListenerInvalidTypeError(
                    '@param raw.listeners Invalid type ' + type(raw.listeners) + ', required: object.'
                )
            }
            for (let listener in raw.listeners) {
                if (!is(raw.listeners[listener], 'array')) {
                    throw new ListenerInvalidTypeError(
                        '@param raw.listeners[listener] Invalid type ' + type(raw.listeners[listener]) + ', required: array.'
                    )
                }
                for (let [i, value] of raw.listeners[listener].entries()) {
                    if (value.length < 2) {
                        throw new ListenerSyntaxError(
                            '@param listener[' + i + '] Method and arguments is not defined.'
                        )
                    }
                    let methodName = value[0]
                    let args = value[1]
                    serviceBag.addListener(listener, methodName, args)
                }
            }
        }

        if ('alias' in raw) {
            serviceBag.setAlias(raw.alias)
        }

        if ('public' in raw) {
            serviceBag.setPublic(raw.public)
        }

        return serviceBag
    }
}

