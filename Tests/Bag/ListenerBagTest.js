/**
 * @package @cyrhla/container
 * @license MIT
 * @copyright Krystian Pietruszka <kpietru@cyrhla.com>
 * @see http://www.cyrhla.com
 */

'use strict'

const Tester      = require('@cyrhla/tester/Tester')
const CallBag     = require('../../Bag/CallBag')
const ListenerBag = require('../../Bag/ListenerBag')

/**
 * ListenerBagTest
 *
 * @author Krystian Pietruszka <kpietru@cyrhla.com>
 */
module.exports = class ListenerBagTest extends Tester
{
    testInstanceOf()
    {
        this.assertInstanceOf(ListenerBag, new ListenerBag('someKey', 'someMethod', []))
        this.assertInstanceOf(ListenerBag, new ListenerBag('someKey', new CallBag('someMethod', [])))
    }

    testConstructorArgumentInvalidTypeError()
    {
        // Invalid key.
        var args = [0, null, false, Object, new Object(), Symbol('foo'), /^/, [], undefined]
        for (let [index, arg] of args.entries()) {
            this.assertError('InvalidTypeError', function() {
                new ListenerBag(arg, '', [])
            }, index)
        }

        // Invalid method.
        var args = [0, null, false, Object, new Object(), Symbol('foo'), /^/, [], undefined]
        for (let [index, arg] of args.entries()) {
            this.assertError('InvalidTypeError', function() {
                new ListenerBag('', arg, [])
            }, index)
        }

        // Invalid args.
        var args = ['', 0, null, false, Object, new Object(), Symbol('foo'), /^/]
        for (let [index, arg] of args.entries()) {
            this.assertError('InvalidTypeError', function() {
                new ListenerBag('', '', arg)
            }, index)
        }
    }

    testGetKeyReturnsString()
    {
        this.assertSame('someKey', new ListenerBag('someKey', 'someMethod', []).getKey())
    }

    testGetCallReturnsObject()
    {
        var obj = new ListenerBag('someKey', 'someMethod', []).getCall()
        this.assertSame('someMethod', obj.getMethodName())

        var obj = new ListenerBag('someKey', new CallBag('someMethod', [])).getCall()
        this.assertSame('someMethod', obj.getMethodName())
    }

    testStaticCreateFromObjectArgumentInvalidTypeError()
    {
        // Invalid raw.
        var args = ['', 0, null, false, Object, Symbol('foo'), /^/, [], undefined]
        for (let [index, arg] of args.entries()) {
            this.assertError('InvalidTypeError', function() {
                ListenerBag.createFromObject(arg)
            }, index)
        }
    }

    testStaticCreateFromObjectListenerInvalidTypeError()
    {
        var obj = {
            'someKey': null
        }
        this.assertError('ListenerInvalidTypeError', function() {
            ListenerBag.createFromObject(obj)
        })
    }

    testStaticCreateFromObjectListenerSyntaxError()
    {
        var obj = {
            'someKey': []
        }
        this.assertError('ListenerSyntaxError', function() {
            ListenerBag.createFromObject(obj)
        })
    }

    testStaticCreateFromObjectReturnsObject()
    {
        var obj = {
            'someKey': ['someMethod', []]
        }
        this.assertInstanceOf(ListenerBag, ListenerBag.createFromObject(obj))
        this.assertSame('someKey', ListenerBag.createFromObject(obj).getKey())
    }
}

