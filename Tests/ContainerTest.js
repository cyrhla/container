/**
 * @package @cyrhla/container
 * @license MIT
 * @copyright Krystian Pietruszka <kpietru@cyrhla.com>
 * @see http://www.cyrhla.com
 */

'use strict'

const Url          = require('url').URL
const EventEmitter = require('events')
const Tester       = require('@cyrhla/tester/Tester')
const ClassFixture = require('@cyrhla/tester/Fixture/ClassFixture')
const ListenerBag  = require('../Bag/ListenerBag')
const ServiceBag   = require('../Bag/ServiceBag')
const CallBag      = require('../Bag/CallBag')
const Container    = require('../Container')

/**
 * ContainerTest
 *
 * @author Krystian Pietruszka <kpietru@cyrhla.com>
 */
module.exports = class ContainerTest extends Tester
{
    testInstanceOf()
    {
        this.assertInstanceOf(Container, new Container())
    }

    testProperties()
    {
        var container = new Container()

        this.assertSame('parameters.', container._parametersPrefix)
        this.assertSame('services.', container._servicesPrefix)
        this.assertSame('aliases.', container._aliasesPrefix)
        this.assertSame('listeners.', container._listenersPrefix)
        this.assertSame('public.', container._publicPrefix)
        this.assertSame({}, container._data)
        this.assertSame([], container._emitters)
    }

    testHasArgumentInvalidTypeError()
    {
        var container = new Container()

        // Invalid key.
        var args = [0, null, false, Object, new Object(), Symbol('foo'), /^/, [], undefined]
        for (let [index, arg] of args.entries()) {
            this.assertError('InvalidTypeError', function() {
                container.has(arg)
            }, index)
        }
    }

    testHasReturnsBoolean()
    {
        var container = new Container()

        this.assertSame(false, container.has('parameters.foo'))
        this.assertSame(false, container.has('someKey'))
    }

    testSetArgumentInvalidTypeError()
    {
        var container = new Container()

        // Invalid key.
        var args = [0, null, false, Object, new Object(), Symbol('foo'), /^/, [], undefined]
        for (let [index, arg] of args.entries()) {
            this.assertError('InvalidTypeError', function() {
                container.set(arg, '')
            }, index)
        }

        // Invalid value "aliases....".
        var args = [0, null, false, Object, new Object(), Symbol('foo'), /^/, [], undefined]
        for (let [index, arg] of args.entries()) {
            this.assertError('AliasInvalidTypeError', function() {
                container.set('aliases.foo', arg)
            }, index)
        }

        // Invalid value "public....".
        var args = ['', 0, null, Object, new Object(), Symbol('foo'), /^/, [], undefined]
        for (let [index, arg] of args.entries()) {
            this.assertError('PublicInvalidTypeError', function() {
                container.set('public.foo', arg)
            }, index)
        }

        // Invalid value "services....".
        var args = ['', 0, null, false, Object, Symbol('foo'), /^/, [], undefined]
        for (let [index, arg] of args.entries()) {
            this.assertError('ServiceInvalidTypeError', function() {
                container.set('services.foo', arg)
            }, index)
        }
    }

    testSetAliasOverflowError()
    {
        var container = new Container()

        this.assertError('AliasOverflowError', function() {
            container.set('aliases.foo', 'abc')
            container.set('aliases.foo', 'xyz')
        })
    }

    testSetServiceSyntaxError()
    {
        var container = new Container()

        this.assertError('ServiceSyntaxError', function() {
            container.set('services.foo', {})
        })
        this.assertError('ServiceSyntaxError', function() {
            container.set('services.foo', new Object())
        })
    }

    testSetReturnsSelf()
    {
        var container = new Container()

        this.assertInstanceOf(Container, container.set('parameters.foo', 123))
        this.assertInstanceOf(Container, container.set('services.baz', {
            className: '@some/module/Class'
        }))
        this.assertInstanceOf(Container, container.set('aliases.baz', 'services.baz'))
        this.assertInstanceOf(Container, container.set('', ''))
    }

    testSetHasReturnsBoolean()
    {
        var container = new Container()

        container.set('parameters.foo', null)
        this.assertSame(true, container.has('parameters.foo'))

        container.set('parameters.bar', false)
        this.assertSame(true, container.has('parameters.bar'))

        container.set('parameters.baz', '')
        this.assertSame(true, container.has('parameters.baz'))

        container.set('parameters.żółć', '')
        this.assertSame(true, container.has('parameters.żółć'))

        container.set('services.日本', new Map())
        this.assertSame(true, container.has('services.日本'))

        container.set('services. ', new Map())
        this.assertSame(true, container.has('services. '))
    }

    testGetArgumentInvalidTypeError()
    {
        var container = new Container()

        // Invalid key.
        var args = [0, null, false, Object, new Object(), Symbol('foo'), /^/, [], undefined]
        for (let [index, arg] of args.entries()) {
            this.assertError('InvalidTypeError', function() {
                container.get(arg)
            }, index)
        }
    }

    testGetKeyReferenceError()
    {
        var container = new Container()

        this.assertError('KeyReferenceError', function() {
            container.get('services.foo')
        })
    }

    testGetAliasKeyReferenceError()
    {
        var container = new Container()

        container.set('aliases.foo', 'services.bar')
        this.assertError('AliasKeyReferenceError', function() {
            container.get('aliases.foo')
        })
    }

    testGetReturnsMixed()
    {
        var container = new Container()

        container.set('parameters.foo', 0)
        this.assertSame(0, container.get('parameters.foo'))

        container.set('parameters.foo', false)
        this.assertSame(false, container.get('parameters.foo'))

        container.set('parameters.foo', { .0: -1.0 })
        this.assertSame({.0:-1.0}, container.get('parameters.foo'))

        container.set('parameters.foo', 'żółć')
        container.set('parameters.bar', '日本')
        container.set('parameters.baz', '	%parameters.foo%/%parameters.bar%')
        this.assertSame('	żółć/日本', container.get('parameters.baz'))

        container.set('日本', 123)
        container.set('parameters.foo', '%日本%')
        container.set('parameters.bar', '%parameters.foo%')
        container.set('parameters.baz', [' %parameters.foo%', 'a	%parameters.bar% b %parameters.foo%\nc'])
        this.assertSame([' 123', 'a	123 b 123\nc'], container.get('parameters.baz'))

        container.set('parameters.foo', 123)
        container.set('parameters.bar', '%parameters.foo%')
        container.set('parameters.baz', { 0: ' %parameters.foo%', '%parameters.foo%': 'a	%parameters.bar% b %parameters.foo%\nc' })
        this.assertSame({ 0: ' 123', '%parameters.foo%': 'a	123 b 123\nc' }, container.get('parameters.baz'))

        container.set('parameters.foo', 123)
        container.set('aliases.bar', 'parameters.foo')
        container.set('aliases.baz', 'aliases.bar')
        this.assertSame(123, container.get('aliases.baz'))

        container.set('parameters.alias', 'parameters.x')
        container.set('parameters.x', '1% abc 2%')
        container.set('aliases.y', '%parameters.alias%')
        container.set('aliases.z', 'aliases.y')
        this.assertSame('1% abc 2%', container.get('aliases.z'))

        container.set('services.class_fixture', {
            'class': '@cyrhla/tester/Fixture/ClassFixture',
            'public': true
        })
        this.assertInstanceOf(ClassFixture, container.get('services.class_fixture'))
        this.assertSame(false, container.has('public.services.class_fixture'))

        container.set('parameters.class', 'ClassFixture')
        container.set('parameters.b', 'b')
        container.set('parameters.c', 'c')
        container.set('services.class_fixture', {
            className: '@cyrhla/tester/Fixture/%parameters.class%',
            'class': 'bleble',
            alias: 'żółć',
            arguments: [123],
            calls: [
                ['set', ['foo', 'a']],
                ['set', ['bar', '%parameters.b%']],
                ['set', ['baz', 456]]
            ],
            properties: {
                baz: '%parameters.c%',
                0: 1
            },
            listeners: {
                'app.run': [
                    ['set', ['baz', 789]],
                    ['set', ['baz', '%parameters.b%']]
                ]
            },
            'public': false
        })
        container.set('aliases.aloha', 'aliases.żółć')
        this.assertInstanceOf(ClassFixture, container.get('services.class_fixture'))
        this.assertInstanceOf(ClassFixture, container.get('aliases.żółć'))
        this.assertInstanceOf(ClassFixture, container.get('aliases.aloha'))
        this.assertSame('a', container.get('services.class_fixture').foo)
        this.assertSame('b', container.get('services.class_fixture').get('bar'))
        this.assertSame(456, container.get('services.class_fixture').get('baz'))
        this.assertSame(1, container.get('services.class_fixture')[0])
        this.assertSame(1, container.get('services.class_fixture')['0'])
        this.assertSame(false, container.get('public.services.class_fixture'))
        this.assertType('array', container.get('listeners.app.run'))
        this.assertSame('b', container.get('services.class_fixture').get('baz'))

        var services = new ServiceBag(
            '@cyrhla/tester/Fixture/ClassFixture',
            [null, true, false]
        )
        services.addCall('set', ['foo', 1])
        services.addCall('set', ['bar', 2])
        services.setProperty('baz', Symbol('foo'))
        container.set('services.class_fixture', services)
        container.set('listeners.app.some', new ListenerBag('services.class_fixture', 'set', ['baz', 'abc']))
        container.set('listeners.app.some', {
            'services.class_fixture': ['set', ['bar', 'xyz']]
        })
        this.assertInstanceOf(ClassFixture, container.get('services.class_fixture'))
        this.assertSame(1, container.get('services.class_fixture').get('foo'))
        this.assertSame(2, container.get('services.class_fixture').bar)
        this.assertType('symbol', container.get('services.class_fixture').baz)
        this.assertType('array', container.get('listeners.app.some'))
        this.assertSame('abc', container.get('services.class_fixture').get('baz'))
        this.assertSame('xyz', container.get('services.class_fixture').get('bar'))
    }

    testPrepareArgumentInvalidTypeError()
    {
        var container = new Container()

        // Invalid data.
        var args = ['', 0, null, false, Object, Symbol('foo'), /^/, [], undefined]
        for (let [index, arg] of args.entries()) {
            this.assertError('InvalidTypeError', function() {
                container.prepare(arg)
            }, index)
        }

        // Invalid value "aliases....".
        var args = [0, null, false, Object, new Object(), Symbol('foo'), /^/, [], undefined]
        for (let [index, arg] of args.entries()) {
            this.assertError('AliasInvalidTypeError', function() {
                container.prepare({
                    'aliases.foo': arg
                })
            }, index)
        }

        // Invalid value "public....".
        var args = ['', 0, null, Object, new Object(), Symbol('foo'), /^/, [], undefined]
        for (let [index, arg] of args.entries()) {
            this.assertError('PublicInvalidTypeError', function() {
                container.prepare({
                    'public.foo': arg
                })
            }, index)
        }

        // Invalid value "services....".
        var args = ['', 0, null, false, Object, Symbol('foo'), /^/, [], undefined]
        for (let [index, arg] of args.entries()) {
            this.assertError('ServiceInvalidTypeError', function() {
                container.prepare({
                    'services.foo': arg
                })
            }, index)
        }
    }

    testPrepareAliasOverflowError()
    {
        var container = new Container()

        this.assertError('AliasOverflowError', function() {
            container.prepare({
                'aliases.foo': '',
                'aliases.foo': ''
            })
            container.prepare({
                'aliases.foo': ''
            })
        })
    }

    testPrepareServiceSyntaxError()
    {
        var container = new Container()

        this.assertError('ServiceSyntaxError', function() {
            container.prepare({
                'services.foo': {}
            })
        })
    }

    testPrepareReturnsSelf()
    {
        var container = new Container()

        this.assertInstanceOf(Container, container.prepare({}))
    }

    testPrepareGetReturnsMixed()
    {
        var container = new Container()

        this.assertInstanceOf(Container, container.prepare({
            'parameters.a': 0,
            'parameters.b': true,
            'parameters.c': 2,
            'parameters.d': /^abc/,
            'parameters.e': undefined
        }))
        this.assertSame(0, container.get('parameters.a'))
        this.assertSame(true, container.get('parameters.b'))
        this.assertSame(2, container.get('parameters.c'))
        this.assertSame(/^abc/, container.get('parameters.d'))
        this.assertSame(undefined, container.get('parameters.e'))
    }

    testAddEmitterArgumentInvalidTypeError()
    {
        var container = new Container()

        // Invalid data.
        var args = ['', 0, null, false, Object, new Object(), Symbol('foo'), /^/, [], undefined]
        for (let [index, arg] of args.entries()) {
            this.assertError('InvalidTypeError', function() {
                container.addEmitter(arg)
            }, index)
        }
    }

    testAddEmitterReturnsSelf()
    {
        var container = new Container()

        this.assertInstanceOf(Container, container.addEmitter(new EventEmitter()))
        this.assertSame(1, container._emitters.length)
    }

    test_compileArgumentInvalidTypeError()
    {
        var container = new Container()

        // Invalid key.
        var args = [0, null, false, Object, new Object(), Symbol('foo'), /^/, [], undefined]
        for (let [index, arg] of args.entries()) {
            this.assertError('InvalidTypeError', function() {
                container._compile(arg, '')
            }, index)
        }
    }

    test_compileReturnsMixed()
    {
        var container = new Container()

        container.set('parameters.foo', 0)
        this.assertInstanceOf(ServiceBag, container._compile('parameters.bar', new ServiceBag('@cyrhla/container/Container')))

        container.set('parameters.foo', 0)
        this.assertSame([0], container._compile('parameters.bar', ['%parameters.foo%']))

        container.set('parameters.foo', 0)
        this.assertSame({ baz: 0 }, container._compile('parameters.bar', { 'baz': '%parameters.foo%' }))

        container.set('parameters.foo', '@cyrhla/container/Container')
        this.assertSame({ className: '@cyrhla/container/Container' }, container._compile('services.bar', { 'className': '%parameters.foo%' }))

        container.set('parameters.foo', 0)
        this.assertSame(0, container._compile('parameters.bar', '%parameters.foo%'))

        container.set('parameters.foo', true)
        this.assertInstanceOf(Function, container._compile('parameters.bar', function() { return '%parameters.foo%' }))

        container.set('services.foo', new ServiceBag('@cyrhla/container/Container'))
        this.assertInstanceOf(Function, container._compile('services.bar', function() { return '%services.foo%' }))

        container.set('1', 0)
        var obj = { constructor: { constructor: '%1%' } }
        var expect = { constructor: { constructor: 0 } }
        this.assertSame(expect, container._compile('someKey', obj))

        container.set('1', 0)
        var obj = { constructor: '%1%' }
        var expect = { constructor: 0 }
        this.assertSame(expect, container._compile('someKey', obj))

        container.set('1', ' ')
        class constructor
        {
            constructor()
            {
                this.o = '%1%'
            }
            someMethod()
            {
            }
        }
        var obj = new constructor()
        var expect = { "o": " " }
        this.assertSame(expect, container._compile('someKey', obj))
    }

    test_replaceKeysRecursiveArgumentInvalidTypeError()
    {
        var container = new Container()

        // Invalid value.
        var args = ['', 0, null, false, Object, Symbol('foo'), /^/, undefined]
        for (let [index, arg] of args.entries()) {
            this.assertError('InvalidTypeError', function() {
                container._replaceKeysRecursive(arg)
            }, index)
        }
    }

    test_replaceKeysRecursiveReturnsArray()
    {
        var container = new Container()

        var obj = ['foo', [1, null, '3']]
        this.assertSame(obj, container._replaceKeysRecursive(obj))

        container.set('parameters.foo', 123)
        var obj = ['foo', [1, null, '%parameters.foo%', ['', ['%parameters.foo%']]]]
        var expect = ['foo', [1, null, 123, ['', [123]]]]
        this.assertSame(expect, container._replaceKeysRecursive(obj))
    }

    test_replaceKeysRecursiveReturnsObject()
    {
        var container = new Container()

        var obj = { 'foo': { 'bar': [1, null, '3'] } }
        this.assertSame(obj, container._replaceKeysRecursive(obj))

        container.set('parameters.foo', { 'a': true, 'b': new Object() })
        var obj = { 'foo': [false, ['%parameters.foo%']] }
        var expect = { foo: [false, [{ a: true, b: {} }]] }
        this.assertSame(expect, container._replaceKeysRecursive(obj))

        container.set('parameters.foo', 0)
        var obj = { 'foo': { 'bar': { 'baz': '%parameters.foo%abc\n%parameters.foo% xyz%parameters.foo%%parameters.foo%%parameters.foo%' } } }
        var expect = { foo: { bar: { baz: '0abc\n0 xyz000' } } }
        this.assertSame(expect, container._replaceKeysRecursive(obj))

        container.set('1', 0)
        var obj = { constructor: { constructor: '%1%' } }
        var expect = { constructor: { constructor: 0 } }
        this.assertSame(expect, container._replaceKeysRecursive(obj))

        container.set('1', 0)
        var obj = { constructor: '%1%' }
        var expect = { constructor: 0 }
        this.assertSame(expect, container._replaceKeysRecursive(obj))

        container.set('1', ' ')
        class constructor {
            constructor()
            {
                this.o = '%1%'
            }
            someMethod()
            {
            }
        }
        var obj = new constructor()
        var expect = { "o": " " }
        this.assertSame(expect, container._replaceKeysRecursive(obj))

        var obj = { 0: { 1: new ClassFixture('%1%') } }
        var expect = { "0": { "1": { "foo": "%1%" } } }
        this.assertSame(expect, container._replaceKeysRecursive(obj))

        var obj = new Map()
        obj.set('foo', '%bar%')
        var expect = {}
        this.assertSame(expect, container._replaceKeysRecursive(obj))
    }

    test_replaceKeysArgumentInvalidTypeError()
    {
        var container = new Container()

        // Invalid value.
        var args = [0, null, false, Object, new Object(), Symbol('foo'), /^/, [], undefined]
        for (let [index, arg] of args.entries()) {
            this.assertError('InvalidTypeError', function() {
                container._replaceKeys(arg)
            }, index)
        }
    }

    test_replaceKeysReplaceValueInvalidTypeError()
    {
        var container = new Container()

        container.set('parameters.foo', false)
        this.assertError('ReplaceValueInvalidTypeError', function() {
            container._replaceKeys('abc %parameters.foo% xyz')
        })
    }

    test_replaceKeysReturnsMixed()
    {
        var container = new Container()

        this.assertSame(null, container._replaceKeys('%?parameters.foo%'))

        container.set('parameters.foo', 0)
        this.assertSame(0, container._replaceKeys('%parameters.foo%'))

        container.set('parameters.foo', 0)
        this.assertSame('abc 0 xyz', container._replaceKeys('abc %parameters.foo% xyz'))

        container.set('parameters.foo', null)
        this.assertSame(null, container._replaceKeys('%parameters.foo%'))

        container.set('parameters.foo', false)
        this.assertSame(false, container._replaceKeys('%parameters.foo%'))

        container.set('parameters.foo', new Object())
        this.assertSame(new Object(), container._replaceKeys('%parameters.foo%'))

        container.set('parameters.foo', [])
        this.assertSame([], container._replaceKeys('%parameters.foo%'))

        container.set('parameters.foo', undefined)
        this.assertSame(undefined, container._replaceKeys('%parameters.foo%'))
    }

    test_buildClassArgumentInvalidTypeError()
    {
        var container = new Container()

        // Invalid services.
        var args = ['', 0, null, false, Object, new Object(), Symbol('foo'), /^/, [], undefined]
        for (let [index, arg] of args.entries()) {
            this.assertError('InvalidTypeError', function() {
                container._buildClass(arg)
            }, index)
        }
    }

    test_buildClassMethodReferenceError()
    {
        var container = new Container()

        var mocker = this.createMocker(ServiceBag, ['@cyrhla/container/Container'])
            .setMethod('getClassName', function() {
                return '@cyrhla/container/Container'
            })
            .setMethod('getArguments', function() {
                return []
            })
            .setMethod('getProperties', function() {
                return {}
            })
            .setMethod('getCalls', function() {
                return [
                    new CallBag('hasssssssssssssss', [])
                ]
            })
            .compile()

        this.assertError('MethodReferenceError', function() {
            container._buildClass(mocker)
        })
    }

    test_buildClassReturnsObject()
    {
        var container = new Container()

        var mocker = this.createMocker(ServiceBag, ['@cyrhla/container/Container'])
            .setMethod('getClassName', function() {
                return '@cyrhla/container/Container'
            })
            .setMethod('getArguments', function() {
                return []
            })
            .setMethod('getProperties', function() {
                return {}
            })
            .setMethod('getCalls', function() {
                return [
                    new CallBag('has', ['parameters.foo'])
                ]
            })
            .compile()

        this.assertInstanceOf(Container, container._buildClass(mocker))
    }

    test_buildClassReplaceKeysReturnsObject()
    {
        var container = new Container()

        container.set('parameters.className', '@cyrhla/tester/Fixture/ClassFixture.js')
        container.set('parameters.foo', 1)
        container.set('parameters.bar', 2)
        container.set('parameters.baz', 3)
        container.set('parameters.propertyName', 'foo')
        container.set('parameters.propertyValue', 'abc')
        container.set('parameters.methodName', 'set')
        container.set('parameters.methodKey', 'bar')
        container.set('parameters.methodValue', 'xyz')

        var service = new ServiceBag('%parameters.className%', ['%parameters.foo%', '%parameters.bar%', '%parameters.baz%'])
            .setProperty('foo', '%parameters.propertyValue%')
            .addCall('%parameters.methodName%', ['%parameters.methodKey%', '%parameters.methodValue%'])

        this.assertInstanceOf(ClassFixture, container._buildClass(service))
        this.assertSame('abc', container._buildClass(service).foo)
        this.assertSame('xyz', container._buildClass(service).bar)
        this.assertSame(3, container._buildClass(service).baz)
    }

    test_buildClassNameDotsReturnsObject()
    {
        var container = new Container()

        var service = new ServiceBag('url.URL', ['https://www.example.com/foo?bar=baz#top'])

        this.assertInstanceOf(Url, container._buildClass(service))
        this.assertSame('https://www.example.com/foo?bar=baz#top', container._buildClass(service).href)
        this.assertSame('https:', container._buildClass(service).protocol)
        this.assertSame('www.example.com', container._buildClass(service).hostname)
        this.assertSame('/foo', container._buildClass(service).pathname)
    }

    test_requireClassArgumentInvalidTypeError()
    {
        var container = new Container()

        // Invalid className.
        var args = [0, null, false, Object, new Object(), Symbol('foo'), /^/, [], undefined]
        for (let [index, arg] of args.entries()) {
            this.assertError('InvalidTypeError', function() {
                container._requireClass(arg, [])
            }, index)
        }

        // Invalid args.
        var args = ['', 0, null, false, Object, new Object(), Symbol('foo'), /^/, undefined]
        for (let [index, arg] of args.entries()) {
            this.assertError('InvalidTypeError', function() {
                container._requireClass('', arg)
            }, index)
        }
    }

    test_requireClassError()
    {
        var container = new Container()

        this.assertError('Error', function() {
            container._requireClass('lllllllllllllllllllllll', [])
        })
    }

    test_requireClassReturnsObject()
    {
        var container = new Container()

        var obj = container._requireClass('@cyrhla/tester/Fixture/ClassFixture.js', [1, 2, 3])
        this.assertInstanceOf(ClassFixture, obj)

        var obj = container._requireClass('url.URL', ['https://www.example.com/foo?bar=baz#top'])
        this.assertInstanceOf(Url, obj)
    }

    test_callListenersArgumentInvalidTypeError()
    {
        var container = new Container()

        // Invalid listeners.
        var args = ['', 0, null, false, Object, new Object(), Symbol('foo'), /^/, undefined]
        for (let [index, arg] of args.entries()) {
            this.assertError('InvalidTypeError', function() {
                container._callListeners(arg)
            }, index)
        }

        // Invalid compile.
        var args = ['', 0, null, Object, new Object(), Symbol('foo'), /^/, []]
        for (let [index, arg] of args.entries()) {
            this.assertError('InvalidTypeError', function() {
                container._callListeners([], arg)
            }, index)
        }
    }

    test_callListenersMethodReferenceError()
    {
        var container = new Container()

        container.set('services.class_fixture', {
            'class': '@cyrhla/tester/Fixture/ClassFixture'
        })
        var listeners = [
            new ListenerBag('services.class_fixture', 'settttttttttttttt', [])
        ]
        this.assertError('MethodReferenceError', function() {
            container._callListeners(listeners)
        })
    }

    test_callListenersReturnsArray()
    {
        var container = new Container()

        container.set('parameters.foo', 'abc')
        container.set('services.class_fixture', {
            'class': '@cyrhla/tester/Fixture/ClassFixture'
        })

        var listeners = [
            new ListenerBag('services.class_fixture', 'set', ['foo', 123]),
            new ListenerBag('services.class_fixture', 'set', ['bar', '%parameters.foo%'])
        ]
        this.assertSame('set', container._callListeners(listeners)[0].getCall().getMethodName())
        this.assertSame('abc', container._callListeners(listeners)[1].getCall().getArguments()[1])

        var listeners = [
            new ListenerBag('services.class_fixture', 'set', ['bar', '%parameters.foo%'])
        ]
        var compile = false
        this.assertSame('%parameters.foo%', container._callListeners(listeners, compile)[0].getCall().getArguments()[1])
    }
}

