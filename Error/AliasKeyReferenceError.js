/**
 * @package @cyrhla/container
 * @license MIT
 * @copyright Krystian Pietruszka <kpietru@cyrhla.com>
 * @see http://www.cyrhla.com
 */

'use strict'

const KeyReferenceError = require('@cyrhla/container/Error/KeyReferenceError')

/**
 * The AliasKeyReferenceError thrown when the key for alias does not exist.
 *
 * @author Krystian Pietruszka <kpietru@cyrhla.com>
 */
module.exports = class AliasKeyReferenceError extends KeyReferenceError
{
    /**
     * Initializes this class and renames the constructor.
     *
     * @param string message
     */
    constructor(message)
    {
        super(message)
        super.name = this.constructor.name
    }
}

