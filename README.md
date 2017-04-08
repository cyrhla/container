container
=========
**This is development (master) version.<br> For production version (relase) see
<http://github.com/cyrhla/container/tree/v0.0.1>**
- Version: 0.0.1-dev
- Technologies:
  - JavaScript
- Copyright / Authors:
  - Krystian Pietruszka <kpietru@cyrhla.com>
- Licenses:
  - MIT <http://spdx.org/licenses/MIT>
- Download: <http://github.com/cyrhla/container/releases>
- Homepage: <http://www.cyrhla.com>
- More: package.json

The "container" is a simple key/value map for dependency injection (DI).
________________________________________________________________________

Install
-------

    npm install @cyrhla/container

Usage
-----

Simple example*:

    const Container  = require('@cyrhla/container/Container')
    const ServiceBag = require('@cyrhla/container/Bag/ServiceBag')

    var container = new Container()

    var serviceFoo = new ServiceBag('@some/module/Foo', [1, 2, 3])

    container.set('services.foo', serviceFoo)
    // ...

    var foo = container.get('services.foo')
    // ...

The more complicated example*:

    const Container  = require('@cyrhla/container/Container')
    const ServiceBag = require('@cyrhla/container/Bag/ServiceBag')
    const CallBag    = require('@cyrhla/container/Bag/CallBag')

    var container = new Container()

    var serviceFoo = new ServiceBag('@some/module/Foo', [1, 2, 3])
        .setAlias('some')
        .addCall(new CallBag('someMethod1', []))
        .addCall(new CallBag('someMethod2', [123]))
        .addListener('emit_name', new CallBag('logMethod', ['abc']))
        .setPublic(true)

    container.set('services.foo', serviceFoo)
    // ...

    var foo = container.get('services.foo')
    // ...

Simple example, raw*:

    const Container = require('@cyrhla/container/Container')

    var container = new Container()

    var serviceFoo = {
        class: '@some/module/Foo'
    }

    container.set('services.foo', serviceFoo)
    // ...

    var foo = container.get('services.foo')
    // ...

The more complicated example, raw with the replacement keys and listeners*:

    const Container    = require('@cyrhla/container/Container')
    const EventEmitter = require('events')

    var container = new Container()
    var emitter = new EventEmitter()

    container.addEmitter(emitter)

    container.set('parameters.arg1', 123)
    container.set('parameters.arg2', 'abc')

    var serviceFoo = {
        class: '@some/module/Foo',
        alias: 'some',
        calls: [
            ['someMethod1', []],
            ['someMethod2', ['%parameters.arg1%']]
        ],
        addListener: {
            emit_name: [
                ['logMethod', ['%parameters.arg2%']]
            ]
        },
        public: true
    }

    container.set('services.foo', serviceFoo)
    // ...

    var foo = container.get('services.foo')
    // ...

API
---

### Class Container (Container.js)

- Container()
  - has( string: __key__ ): boolean
  - set( string: __key__, mixed: __value__ ): self
  - get( string: __key__ ): mixed
  - prepare( object: __data__ ): self
  - addEmitter( EventEmitter: __emitter__ ): self

### Class ServiceBag (Bag/ServiceBag.js)

- ServiceBag( string: __className__, mixed[]: __args__ = [] )
  - getClassName(): string
  - getArguments(): mixed[]
  - setAlias( string: __alias__ ): self
  - getAlias(): null|string
  - setProperty( string: __property__, mixed: __value__ ): self
  - getProperties(): object
  - addCall( string|CallBag: __method__, mixed[]: __args__ = [] ): self
  - getCalls(): CallBag[]
  - addListener( string: __event__, string|CallBag: __method__, mixed[]: __args__ = []): self
  - getListeners(): object
  - setPublic( boolean: __publ__ ): self
  - isPublic(): boolean
  - static createFromObject( object: __raw__ ): object

### Class ListenerBag (Bag/ListenerBag.js)

- ListenerBag( string: __key__, string|CallBag: __method__, mixed[]: __args__ = [] )
  - getKey(): string
  - getCall(): CallBag
  - static createFromObject( object: __raw__ ): object

### Class CallBag (Bag/CallBag.js)

- CallBag( string: __methodName__, mixed[]: __args__ = [] )
  - getMethodName(): string
  - getArguments(): mixed[]

References
----------

1. [Node.js Documentation][1]
2. [The Map object][2]

[1]: http://nodejs.org/api/modules.html
[2]: http://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map

___________________________________________
[*] Paths should be modified to the module.

