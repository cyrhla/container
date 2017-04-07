/**
 * @package @cyrhla/container
 * @license MIT
 * @copyright Krystian Pietruszka <kpietru@cyrhla.com>
 * @see http://www.cyrhla.com
 */

'use strict'

const valid = require('@cyrhla/tester/valid')

/**
 * Bag for method and arguments.
 *
 * @author Krystian Pietruszka <kpietru@cyrhla.com>
 */
module.exports = class CallBag
{
    /**
     * Initializes this class with the given options.
     *
     * @param string  methodName
     * @param mixed[] args       Default empty array
     */
    constructor(methodName, args = [])
    {
        valid(methodName, 'string')
        valid(args, 'array')

        /** @type string */
        this._methodName = methodName

        /** @type mixed[] */
        this._arguments = args
    }

    /**
     * Gets the method name.
     *
     * @return string
     */
    getMethodName()
    {
        return this._methodName
    }

    /**
     * Gets the arguments.
     *
     * @return array
     */
    getArguments()
    {
        return this._arguments
    }
}

