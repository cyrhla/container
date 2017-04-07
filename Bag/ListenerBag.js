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
const ListenerSyntaxError      = require('@cyrhla/container/Error/ListenerSyntaxError')
const ListenerInvalidTypeError = require('@cyrhla/container/Error/ListenerInvalidTypeError')

/**
 * Bag for listeners.
 *
 * @author Krystian Pietruszka <kpietru@cyrhla.com>
 */
module.exports = class ListenerBag
{
    /**
     * Initializes this class with the given options.
     *
     * @param string         key
     * @param string|CallBag method
     * @param mixed[]        args   Default empty array
     */
    constructor(key, method, args = [])
    {
        valid(key, 'string')
        valid(method, CallBag, 'string')
        valid(args, 'array')

        /** @type string */
        this._key = key

        /** @type CallBag */
        this._call = is(method, 'string') ? new CallBag(method, args) : method
    }

    /**
     * Gets the key.
     *
     * @return string
     */
    getKey()
    {
        return this._key
    }

    /**
     * Gets the CallBag.
     *
     * @return CallBag
     */
    getCall()
    {
        return this._call
    }

    /**
     * Creates a new object from the raw object.
     *
     * @param object raw
     *
     * @throw ListenerInvalidTypeError
     * @throw ListenerSyntaxError
     *
     * @return self New instance.
     */
    static createFromObject(raw)
    {
        valid(raw, 'object')

        for (let key in raw) {
            var value = raw[key]
            if (!is(value, 'array')) {
                throw new ListenerInvalidTypeError(
                    '@param value Invalid type ' + type(value) + ', required: array.'
                )
            }
            if (value.length < 2) {
                throw new ListenerSyntaxError(
                    '@param value Method and arguments is not defined.'
                )
            }
            var listenerBag = new ListenerBag(key, value[0], value[1])

            return listenerBag
        }
    }
}

