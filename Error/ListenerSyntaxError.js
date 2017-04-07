/**
 * @package @cyrhla/container
 * @license MIT
 * @copyright Krystian Pietruszka <kpietru@cyrhla.com>
 * @see http://www.cyrhla.com
 */

'use strict'

/**
 * The ListenerSyntaxError thrown when the listener syntax error.
 *
 * @author Krystian Pietruszka <kpietru@cyrhla.com>
 */
module.exports = class ListenerSyntaxError extends SyntaxError
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

