/**
 * @package @cyrhla/container
 * @license MIT
 * @copyright Krystian Pietruszka <kpietru@cyrhla.com>
 * @see http://www.cyrhla.com
 */

'use strict'

const valid = require('@cyrhla/tester/valid')

/**
 * Bag for raw values before compilation.
 *
 * @author Krystian Pietruszka <kpietru@cyrhla.com>
 */
module.exports = class LazyBag
{
    /**
     * Initializes this class with the given options.
     *
     * @param mixed raw
     */
    constructor(raw)
    {
        valid(raw, 'mixed')

        /** @type mixed */
        this._raw = raw
    }

    /**
     * Gets the raw.
     *
     * @return mixed
     */
    getRaw()
    {
        return this._raw
    }
}

