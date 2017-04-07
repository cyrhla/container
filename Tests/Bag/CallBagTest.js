/**
 * @package @cyrhla/container
 * @license MIT
 * @copyright Krystian Pietruszka <kpietru@cyrhla.com>
 * @see http://www.cyrhla.com
 */

'use strict'

const Tester  = require('@cyrhla/tester/Tester')
const CallBag = require('../../Bag/CallBag')

/**
 * CallBagTest
 *
 * @author Krystian Pietruszka <kpietru@cyrhla.com>
 */
module.exports = class CallBagTest extends Tester
{
    testInstanceOf()
    {
        this.assertInstanceOf(CallBag, new CallBag('someMethod', []))
    }

    testConstructorArgumentInvalidTypeError()
    {
        // Invalid methodName.
        var args = [0, null, false, Object, new Object(), Symbol('foo'), /^/, [], undefined]
        for (let [index, arg] of args.entries()) {
            this.assertError('InvalidTypeError', function() {
                new CallBag(arg, [])
            }, index)
        }

        // Invalid args.
        var args = ['', 0, null, false, Object, new Object(), Symbol('foo'), /^/]
        for (let [index, arg] of args.entries()) {
            this.assertError('InvalidTypeError', function() {
                new CallBag('', arg)
            }, index)
        }
    }

    testGetMethodNameReturnsString()
    {
        this.assertSame('someMethod', new CallBag('someMethod', []).getMethodName())
    }

    testGetArgumentsReturnsArray()
    {
        this.assertSame([], new CallBag('someMethod').getArguments())
        this.assertSame([1, 2, 3], new CallBag('someMethod', [1, 2, 3]).getArguments())
    }
}

