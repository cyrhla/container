/**
 * @package @cyrhla/container
 * @license MIT
 * @copyright Krystian Pietruszka <kpietru@cyrhla.com>
 * @see http://www.cyrhla.com
 */

'use strict'

const Tester  = require('@cyrhla/tester/Tester')
const LazyBag = require('../../Bag/LazyBag')

/**
 * LazyBagTest
 *
 * @author Krystian Pietruszka <kpietru@cyrhla.com>
 */
module.exports = class LazyBagTest extends Tester
{
    testInstanceOf()
    {
        this.assertInstanceOf(LazyBag, new LazyBag(''))
        this.assertInstanceOf(LazyBag, new LazyBag(0))
        this.assertInstanceOf(LazyBag, new LazyBag(null))
        this.assertInstanceOf(LazyBag, new LazyBag(false))
        this.assertInstanceOf(LazyBag, new LazyBag(Object))
        this.assertInstanceOf(LazyBag, new LazyBag(new Object()))
        this.assertInstanceOf(LazyBag, new LazyBag(Symbol('foo')))
        this.assertInstanceOf(LazyBag, new LazyBag(/^/))
        this.assertInstanceOf(LazyBag, new LazyBag([]))
        this.assertInstanceOf(LazyBag, new LazyBag(undefined))
    }

    testGetRawReturnsMixed()
    {
        this.assertSame(undefined,    new LazyBag().getRaw())
        this.assertSame('',           new LazyBag('').getRaw())
        this.assertSame(0,            new LazyBag(0).getRaw())
        this.assertSame(null,         new LazyBag(null).getRaw())
        this.assertSame(false,        new LazyBag(false).getRaw())
        this.assertSame(Object,       new LazyBag(Object).getRaw())
        this.assertSame(new Object(), new LazyBag(new Object()).getRaw())
        this.assertType('symbol',     new LazyBag(Symbol('foo')).getRaw())
        this.assertSame(/^/,          new LazyBag(/^/).getRaw())
        this.assertSame([],           new LazyBag([]).getRaw())
        this.assertSame(undefined,    new LazyBag(undefined).getRaw())
    }
}

