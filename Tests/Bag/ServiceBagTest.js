/**
 * @package @cyrhla/container
 * @license MIT
 * @copyright Krystian Pietruszka <kpietru@cyrhla.com>
 * @see http://www.cyrhla.com
 */

'use strict'

const Tester     = require('@cyrhla/tester/Tester')
const CallBag    = require('../../Bag/CallBag')
const ServiceBag = require('../../Bag/ServiceBag')

/**
 * ServiceBagTest
 *
 * @author Krystian Pietruszka <kpietru@cyrhla.com>
 */
module.exports = class ServiceBagTest extends Tester
{
    testInstanceOf()
    {
        this.assertInstanceOf(ServiceBag, new ServiceBag('@some/module/Class', [1, 2, 3]))
    }

    testContructorArgumentInvalidTypeError()
    {
        // Invalid className.
        var args = [0, null, false, Object, new Object(), Symbol('foo'), /^/, [], undefined]
        for (let [index, arg] of args.entries()) {
            this.assertError('InvalidTypeError', function() {
                new ServiceBag(arg)
            }, index)
        }

        // Invalid args.
        var args = ['', 0, null, false, Object, new Object(), Symbol('foo'), /^/]
        for (let [index, arg] of args.entries()) {
            this.assertError('InvalidTypeError', function() {
                new ServiceBag('', arg)
            }, index)
        }
    }

    testGetClassNameReturnsString()
    {
        var obj = new ServiceBag('@some/module/Class')

        this.assertSame('@some/module/Class', obj.getClassName())
    }

    testGetArgumentsReturnsArray()
    {
        var obj = new ServiceBag('@some/module/Class', [1, '2'])

        this.assertSame([1, '2'], obj.getArguments())
    }

    testSetAliasArgumentInvalidTypeError()
    {
        var serviceBag = new ServiceBag('@some/module/Class')

        // Invalid alias.
        var args = [0, null, false, Object, new Object(), Symbol('foo'), /^/, [], undefined]
        for (let [index, arg] of args.entries()) {
            this.assertError('InvalidTypeError', function() {
                serviceBag.setAlias(arg)
            }, index)
        }
    }

    testSetAliasReturnsSelf()
    {
        var serviceBag = new ServiceBag('@some/module/Class')

        this.assertInstanceOf(ServiceBag, serviceBag.setAlias(''))
    }

    testGetAliasReturnsNullOrString()
    {
        var serviceBag = new ServiceBag('@some/module/Class')

        this.assertSame(null, serviceBag.getAlias())

        serviceBag.setAlias('someAlias')
        this.assertSame('someAlias', serviceBag.getAlias())
    }

    testSetPropertyArgumentInvalidTypeError()
    {
        var serviceBag = new ServiceBag('@some/module/Class')

        // Invalid property.
        var args = [0, null, false, Object, new Object(), Symbol('foo'), /^/, [], undefined]
        for (let [index, arg] of args.entries()) {
            this.assertError('InvalidTypeError', function() {
                serviceBag.setProperty(arg, '')
            }, index)
        }
    }

    testSetPropertyReturnsSelf()
    {
        var serviceBag = new ServiceBag('@some/module/Class')

        this.assertInstanceOf(ServiceBag, serviceBag.setProperty('', ''))
    }

    testGetPropertiesReturnsObject()
    {
        var serviceBag = new ServiceBag('@some/module/Class')

        this.assertSame({}, serviceBag.getProperties())

        serviceBag.setProperty('someProperty', '')
        this.assertSame({ someProperty: '' }, serviceBag.getProperties())
    }

    testAddCallArgumentInvalidTypeError()
    {
        var serviceBag = new ServiceBag('@some/module/Class')

        // Invalid method.
        var args = [0, null, false, Object, new Object(), Symbol('foo'), /^/, [], undefined]
        for (let [index, arg] of args.entries()) {
            this.assertError('InvalidTypeError', function() {
                serviceBag.addCall(arg)
            }, index)
        }

        // Invalid args.
        var args = ['', 0, null, false, Object, new Object(), Symbol('foo'), /^/]
        for (let [index, arg] of args.entries()) {
            this.assertError('InvalidTypeError', function() {
                serviceBag.addCall('', arg)
            }, index)
        }
    }

    testGetCallsReturnsArray()
    {
        var serviceBag = new ServiceBag('@some/module/Class')

        serviceBag.addCall('someMethod', [1, '2'])
        this.assertType('array', serviceBag.getCalls())
        this.assertSame('someMethod', serviceBag.getCalls()[0].getMethodName())

        serviceBag.addCall(new CallBag('żółć', []))
        this.assertSame('żółć', serviceBag.getCalls()[1].getMethodName())
    }

    testAddListenerArgumentInvalidTypeError()
    {
        var serviceBag = new ServiceBag('@some/module/Class')

        // Invalid event.
        var args = [0, null, false, Object, new Object(), Symbol('foo'), /^/, [], undefined]
        for (let [index, arg] of args.entries()) {
            this.assertError('InvalidTypeError', function() {
                serviceBag.addListener(arg, '')
            }, index)
        }

        // Invalid method.
        var args = [0, null, false, Object, new Object(), Symbol('foo'), /^/, [], undefined]
        for (let [index, arg] of args.entries()) {
            this.assertError('InvalidTypeError', function() {
                serviceBag.addListener('', arg)
            }, index)
        }

        // Invalid args.
        var args = ['', 0, null, false, Object, new Object(), Symbol('foo'), /^/]
        for (let [index, arg] of args.entries()) {
            this.assertError('InvalidTypeError', function() {
                serviceBag.addListener('', '', arg)
            }, index)
        }
    }

    testAddListenerReturnsSelf()
    {
        var serviceBag = new ServiceBag('@some/module/Class')

        this.assertInstanceOf(ServiceBag, serviceBag.addListener('', ''))
        this.assertInstanceOf(ServiceBag, serviceBag.addListener('', '', []))
    }

    testGetListenersReturnsObject()
    {
        var serviceBag = new ServiceBag('@some/module/Class')

        this.assertSame({}, serviceBag.getListeners())

        serviceBag.addListener('foo', 'someMethod', [])
        this.assertSame('someMethod', serviceBag.getListeners()['foo'][0].getMethodName())

        serviceBag.addListener('foo', new CallBag('someMethod2', [1, 2, 3]))
        this.assertSame([1, 2, 3], serviceBag.getListeners()['foo'][1].getArguments())
    }

    testSetPublicArgumentInvalidTypeError()
    {
        var serviceBag = new ServiceBag('@some/module/Class')

        // Invalid publ.
        var args = ['', 0, null, Object, new Object(), Symbol('foo'), /^/, [], undefined]
        for (let [index, arg] of args.entries()) {
            this.assertError('InvalidTypeError', function() {
                serviceBag.setPublic(arg)
            }, index)
        }
    }

    testSetPublicReturnsSelf()
    {
        var serviceBag = new ServiceBag('@some/module/Class')

        this.assertInstanceOf(ServiceBag, serviceBag.setPublic(true))
        this.assertInstanceOf(ServiceBag, serviceBag.setPublic(false))
    }

    testIsPublic()
    {
        var serviceBag = new ServiceBag('@some/module/Class')

        this.assertSame(true, serviceBag.isPublic())

        serviceBag.setPublic(false)
        this.assertSame(false, serviceBag.isPublic())
    }

    testStaticCreateFromObjectArgumentInvalidTypeError()
    {
        // Invalid raw.
        var args = ['', 0, null, Object, Symbol('foo'), /^/, [], undefined]
        for (let [index, arg] of args.entries()) {
            this.assertError('InvalidTypeError', function() {
                ServiceBag.createFromObject(arg)
            }, index)
        }
    }

    testStaticCreateFromObjectServiceSyntaxError()
    {
        var obj = {}
        this.assertError('ServiceSyntaxError', function() {
            ServiceBag.createFromObject(obj)
        })
    }

    testStaticCreateFromObjectServiceInvalidTypeError()
    {
        var obj = {
            'className': null
        }
        this.assertError('ServiceInvalidTypeError', function() {
            ServiceBag.createFromObject(obj)
        })

        var obj = {
            'className': '@some/module/Class',
            'calls': null
        }
        this.assertError('ServiceInvalidTypeError', function() {
            ServiceBag.createFromObject(obj)
        })
    }

    testStaticCreateFromObjectListenerInvalidTypeError()
    {
        var obj = {
            'className': '@some/module/Class',
            'listeners': null
        }
        this.assertError('ListenerInvalidTypeError', function() {
            ServiceBag.createFromObject(obj)
        })

        var obj = {
            'className': '@some/module/Class',
            'listeners': {
                'someEvent': null
            }
        }
        this.assertError('ListenerInvalidTypeError', function() {
            ServiceBag.createFromObject(obj)
        })
    }

    testStaticCreateFromObjectListenerSyntaxError()
    {
        var obj = {
            'className': '@some/module/Class',
            'listeners': {
                'someEvent': [
                    ['someMethod']
                ]
            }
        }
        this.assertError('ListenerSyntaxError', function() {
            ServiceBag.createFromObject(obj)
        })
    }

    testStaticCreateFromObjectReturnsObject()
    {
        var obj = {
            'className': '@some/module/Class'
        }
        this.assertInstanceOf(ServiceBag, ServiceBag.createFromObject(obj))

        var obj = {
            'className': '@some/module/Class',
            'class': 'some',
            'alias': 'foo',
            'properties': {
                'someProperty': true
            },
            'calls': [
                ['someMethod', [1, 2, 3]]
            ],
            'listeners': {
                'someEvent': [
                    ['someMethod', []]
                ]
            },
            'public': false
        }
        this.assertSame('@some/module/Class', ServiceBag.createFromObject(obj).getClassName())
        this.assertSame(true, ServiceBag.createFromObject(obj).getProperties()['someProperty'])
        this.assertSame([1, 2, 3], ServiceBag.createFromObject(obj).getCalls()[0].getArguments())
        this.assertSame('foo', ServiceBag.createFromObject(obj).getAlias())
        this.assertSame(false, ServiceBag.createFromObject(obj).isPublic())
    }
}

