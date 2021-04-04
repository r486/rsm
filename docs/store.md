# Store

flat key-value store with triggers.

acts as a wrapper over something like this:

```ecmascript 6
{
    foo: { value: 'lorem', handlers: [fn, fn, fn, ...] },
    bar: { value: 'ipsum', handlers: [fn, fn, fn, ...] },
    ...
}
```

so entities subscribe to a store property by providing handler functions that will be called every time its value has been
set via `.set`/`.setx`/`.alt` wrapper methods.

## hello world

```ecmascript 6
const store = new Store({
    foo: '',
    bar: '',
    counter: 0
})
```

* subscribe

```ecmascript 6
store.sub('foo', () => console.log('! foo has updated !'))
store.sub('bar', (v) => console.log(`bar = ${ v }`))
store.sub('counter', (current, previous) => console.log(`counter +${ current - previous }`))
```

* update

```ecmascript 6
store.set('foo', 'lorem')      // '! foo has updated !'
store.set('bar', 'ipsum')      // 'bar = ipsum'
store.alt('counter', n => ++n) // 'counter +1'

store.setx({ 
    bar: 'enim', 
    counter: 5, 
    foo: 'elit' 
}) // handlers run in the same order as batch keys: 'bar = enim', then 'counter +4', then '! foo has updated !'
```

* get

```ecmascript 6
store.get('counter')     // 5
store.getx('foo', 'bar') // { foo: 'elit', bar: 'enim' }
```

## API

all methods are synchronous


### **constructor**

```
@param {Object.<string, *>} props
```

object given to the to the constructor sets the top-level structure of the store permanently - values can be changed, but
properties can't be added or removed
```
store = new Store({
    foo: 'bar',
    lorem: 'ipsum',
    counter: 0
})
```


### **properties**

the store does not manipulate its properties in any way.<br>
mutable values are stored, passed to property handlers and returned via `.get`/`.getx` by reference, without
cloning/freezing/etc.<br>
no attempt is made to make properties observable - outside changes to mutable values do not trigger their store handlers
```
store = new Store({
    obj: { foo: 'bar', elit: 'enim' },
    arr: [0, 1, 2],
    map: new Map(),
    set: new Set()
})
store.sub('obj', () => console.log('obj has updated'))
store.sub('arr', () => console.log('arr has updated'))
store.sub('map', () => console.log('map has updated'))
store.sub('set', () => console.log('set has updated'))
const { obj, arr, map, set } = store.getx()
obj.foo = 'baz'     // doesn't trigger the handlers
arr.push(3)         // ditto
map.set('uno', 1)   // ditto
set.add(Date.now()) // ditto
store.setx({ obj, arr, map, set }) // required to trigger the handlers and notify subscribers about the changes
```


### property handlers

```
@callback propertyHandler
@param   {*} current_value
@param   {*} previous_value
@returns {void|*}
```

property handlers are functions that run every time the property has been updated via `.set`, `.setx` or `.alt`,
even if its value didn't change as result.<br>
properties can have multiple handlers, but not multiple instances of the same handler.<br>
handlers run synchronously, in the same order as they were added, and receive the current and the previous value of the
property as arguments. return values of handlers are discarded.<br>
by design, handlers are not intended to act as middleware. attempting to `.set`, `.setx` or `.alt` a property
inside its own handler will cause a stack overflow
```
store = new Store({ counter: 0 })

store.sub('counter', () => console.log('! counter has updated !'))
store.sub('counter', (v) = > console.log(`counter = ${ v }`))
store.sub('counter', (current, previous) => console.log(`diff = ${ current - previous }`)

store.set('counter', 0)        // '! counter has updated !', 'counter = 0', 'diff = 0'
store.alt('counter', n => ++n) // '! counter has updated !', 'counter = 1', 'diff = 1'
store.set('counter', 5)        // '! counter has updated !', 'counter = 5', 'diff = 4'
```


### `.get(key)`

```
@param {string} key
@returns {*}
@throws if the property doesn't exist
```

returns the value of a property
```
store = new Store({ kot: 'meow', birb: 'chirp', snek: 'hissssssssssssssssssssssssssssss' })
store.get('birb') // 'chirp'
```


### `.getx(...keys)`

```
@param {...string} [keys]
@returns {Object.<string, *>}
```

returns multiple properties.<br>
if no keys are specified, returns all properties in the store.<br>
properties are returned as key-value pairs wrapped in a null-prototype object that has no built-in props
```
store = new Store({ mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 7 })
store.getx()             // { mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 7 }
store.getx('fri')        // { fri: 5 }
store.getx('sat', 'sun') // { sat: 6, sun: 7 }
```


### `.set(key, value)`

```
@param {string} key
@param {*} value
@throws if the property doesn't exist
```

sets the value of the property then triggers its handlers
```
store = new Store({ kot: 'meow', birb: 'chirp', snek: 'hiss' })
store.set('birb', 'quack')
```


### `.setx(data)`

```
@param {Object.<string, *>} props
@throws if a property doesn't exist
```

sets multiple properties.<br>
triggers their handlers after all properties in the batch have been set
```
store = new Store({ mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 })
store.setx({ mon: 1 })
store.setx({ tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 7 })
```


### `.alt(key, fn)`

```
@param {string} key
@param {altFn} fn
@throws if the property doesn't exist
```

sets the value of the property to the return value of the provided function.<br>
the function receives the current value of the property as the argument.<br>
triggers property handlers after the value is set
```
store.set('counter', 0)
store.alt('counter', n => ++n) // 1
```


### `.sub(key, handler)`

```
@param {string} key
@param {propertyHandler} handler
@throws – if the property doesn't exist
@throws – if the handler is already attached to the property
```

adds a property handler
```
store.sub('counter', () => console.log('! counter has updated !'))
store.sub('counter', (v) = > console.log(`counter = ${ v }`))
store.sub('counter', (current, previous) => console.log(`diff = ${ current - previous }`)
```

```
componentDidMount () {
    store.sub('foo', this.doSomething)
}
componentWillUnmount () {
    store.unsub('foo', this.doSomething)
}
```


### `.unsub(key, handler)`

```
@param {string} key
@param {propertyHandler} handler
@throws – if the property doesn't exist
@throws – if the handler is not attached to the property
```

removes a property handler
```
componentDidMount () {
    store.sub('foo', this.doSomething)
}
componentWillUnmount () {
    store.unsub('foo', this.doSomething)
}
```

