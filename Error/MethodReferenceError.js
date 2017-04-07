/**
 * @package @cyrhla/container
 * @license MIT
 * @copyright Krystian Pietruszka <kpietru@cyrhla.com>
 * @see http://www.cyrhla.com
 */

'use strict'

/**
 * The MethodReferenceError thrown when the method does not exist.
 *
 * @author Krystian Pietruszka <kpietru@cyrhla.com>
 */
module.exports = class MethodReferenceError extends ReferenceError
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

