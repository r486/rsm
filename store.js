'use strict' // 2021-04-04 11.52

export class Store
{
    /**
    object given to the to the constructor sets the top-level structure of the store permanently - values can be changed, but
    properties can't be added or removed
    @param {Object.<string, *>} props
    @example
    store = new Store({
        foo: 'bar',
        lorem: 'ipsum',
        counter: 0
    })
    @readme ### **constructor**
    */

    constructor (props)
    {
        for (const key in props)
        {
            this.__data[key] = props[key]
            this.__subs[key] = []
        }
    }

    /**
    the store does not manipulate its properties in any way.<br>
    mutable values are stored, passed to property handlers and returned via `.get`/`.getx` by reference, without
    cloning/freezing/etc.<br>
    no attempt is made to make properties observable - outside changes to mutable values do not trigger their store handlers
    @example
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
    @readme ### **properties**
    */

    /**
    internal null-prototype object that stores all properties
    @type {Object.<string, *>}
    @private
    */

    __data = Object.create(null)

    /**
    property handlers are functions that run every time the property has been updated via `.set`, `.setx` or `.alt`,
    even if its value didn't change as result.<br>
    properties can have multiple handlers, but not multiple instances of the same handler.<br>
    handlers run synchronously, in the same order as they were added, and receive the current and the previous value of the
    property as arguments. return values of handlers are discarded.<br>
    by design, handlers are not intended to act as middleware. attempting to `.set`, `.setx` or `.alt` a property
    inside its own handler will cause a stack overflow
    @callback propertyHandler
    @param   {*} current_value
    @param   {*} previous_value
    @returns {void|*}
    @example
    store = new Store({ counter: 0 })

    store.sub('counter', () => console.log('! counter has updated !'))
    store.sub('counter', (v) = > console.log(`counter = ${ v }`))
    store.sub('counter', (current, previous) => console.log(`diff = ${ current - previous }`)

    store.set('counter', 0)        // '! counter has updated !', 'counter = 0', 'diff = 0'
    store.alt('counter', n => ++n) // '! counter has updated !', 'counter = 1', 'diff = 1'
    store.set('counter', 5)        // '! counter has updated !', 'counter = 5', 'diff = 4'
    @readme ### property handlers
    */

    /**
    internal null-prototype object that stores all property handlers
    @type {Object.<string, propertyHandler[]>}
    @private
    */

    __subs = Object.create(null)

    /**
    returns the value of a property
    @param {string} key
    @returns {*}
    @throws if the property doesn't exist
    @example
    store = new Store({ kot: 'meow', birb: 'chirp', snek: 'hissssssssssssssssssssssssssssss' })
    store.get('birb') // 'chirp'
    @readme ### `.get(key)`
    */

    get (key)
    {
        this.__ensurePropsExist(key)
        return this.__data[key]
    }

    /**
    returns multiple properties.<br>
    if no keys are specified, returns all properties in the store.<br>
    properties are returned as key-value pairs wrapped in a null-prototype object that has no built-in props
    @param {...string} [keys]
    @returns {Object.<string, *>}
    @example
    store = new Store({ mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 7 })
    store.getx()             // { mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 7 }
    store.getx('fri')        // { fri: 5 }
    store.getx('sat', 'sun') // { sat: 6, sun: 7 }
    @readme ### `.getx(...keys)`
    */

    getx (...keys)
    {
        if (keys.length)
        {
            this.__ensurePropsExist(...keys)
        }

        const res = Object.create(null)

        for (const key of keys.length ? keys : Object.keys(this.__data))
        {
            res[key] = this.__data[key]
        }

        return res
    }

    /**
    sets the value of the property then triggers its handlers
    @param {string} key
    @param {*} value
    @throws if the property doesn't exist
    @example
    store = new Store({ kot: 'meow', birb: 'chirp', snek: 'hiss' })
    store.set('birb', 'quack')
    @readme ### `.set(key, value)`
    */

    set (key, value)
    {
        this.__ensurePropsExist(key)
        const prev = this.__data[key]
        this.__data[key] = value

        for (const cb of this.__subs[key])
        {
            cb(this.__data[key], prev)
        }
    }

    /**
    sets multiple properties.<br>
    triggers their handlers after all properties in the batch have been set
    @param {Object.<string, *>} props
    @throws if a property doesn't exist
    @example
    store = new Store({ mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 })
    store.setx({ mon: 1 })
    store.setx({ tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 7 })
    @readme ### `.setx(data)`
    */

    setx (props)
    {
        this.__ensurePropsExist(...Object.keys(props))

        const prev = Object.create(null)

        for (const key in props)
        {
            prev[key] = this.__data[key]
            this.__data[key] = props[key]
        }

        for (const key in props)
        {
            for (const cb of this.__subs[key])
            {
                cb(this.__data[key], prev[key])
            }
        }
    }

    /**
    @callback altFn
    @param   {*} current_value
    @returns {*} new value
    */

    /**
    sets the value of the property to the return value of the provided function.<br>
    the function receives the current value of the property as the argument.<br>
    triggers property handlers after the value is set
    @param {string} key
    @param {altFn} fn
    @throws if the property doesn't exist
    @example
    store.set('counter', 0)
    store.alt('counter', n => ++n) // 1
    @readme ### `.alt(key, fn)`
    */

    alt (key, fn)
    {
        this.__ensurePropsExist(key)
        const prev = this.__data[key]
        this.__data[key] = fn(this.__data[key])

        for (const cb of this.__subs[key])
        {
            cb(this.__data[key], prev)
        }
    }

    /**
    adds a property handler
    @param {string} key
    @param {propertyHandler} handler
    @throws – if the property doesn't exist
    @throws – if the handler is already attached to the property
    @example
    store.sub('counter', () => console.log('! counter has updated !'))
    store.sub('counter', (v) = > console.log(`counter = ${ v }`))
    store.sub('counter', (current, previous) => console.log(`diff = ${ current - previous }`)
    @example
    componentDidMount () {
        store.sub('foo', this.doSomething)
    }
    componentWillUnmount () {
        store.unsub('foo', this.doSomething)
    }
    @readme ### `.sub(key, handler)`
    */

    sub (key, handler)
    {
        this.__ensurePropsExist(key)

        if (this.__subs[key].includes(handler))
        {
            throw new Error(`the handler is already attached to the property`)
        }

        this.__subs[key].push(handler)
    }

    /**
    removes a property handler
    @param {string} key
    @param {propertyHandler} handler
    @throws – if the property doesn't exist
    @throws – if the handler is not attached to the property
    @example
    componentDidMount () {
        store.sub('foo', this.doSomething)
    }
    componentWillUnmount () {
        store.unsub('foo', this.doSomething)
    }
    @readme ### `.unsub(key, handler)`
    */

    unsub (key, handler)
    {
        this.__ensurePropsExist(key)

        if (!this.__subs[key].includes(handler))
        {
            throw new Error(`the handler not attached to the property`)
        }

        this.__subs[key].splice(this.__subs[key].indexOf(handler), 1)
    }

    /**
    @param {...string} keys
    @private
    */

    __ensurePropsExist (...keys)
    {
        const err = []

        for (const key of keys)
        {
            if (!Object.prototype.hasOwnProperty.call(this.__data, key))
            {
                err.push(`"${ key }"`)
            }
        }

        if (err.length)
        {
            throw new Error(`no such propert${ err.length > 1 ? 'ies' : 'y' }: ${ err.join(', ') }`)
        }
    }
}