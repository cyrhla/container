/**
 * @package @cyrhla/container
 * @license MIT
 * @copyright Krystian Pietruszka <kpietru@cyrhla.com>
 * @see http://www.cyrhla.com
 */

'use strict'

/**
 * The AliasOverflowError thrown when the alias already exists.
 *
 * @author Krystian Pietruszka <kpietru@cyrhla.com>
 */
module.exports = class AliasOverflowError extends Error
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

