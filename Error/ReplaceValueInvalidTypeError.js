/**
 * @package @cyrhla/container
 * @license MIT
 * @copyright Krystian Pietruszka <kpietru@cyrhla.com>
 * @see http://www.cyrhla.com
 */

'use strict'

const InvalidTypeError = require('@cyrhla/tester/Error/InvalidTypeError')

/**
 * The ReplaceValueInvalidTypeError thrown when the replace value invalid type.
 *
 * @author Krystian Pietruszka <kpietru@cyrhla.com>
 */
module.exports = class ReplaceValueInvalidTypeError extends InvalidTypeError
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

