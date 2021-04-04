'use strict' // 2021-04-04 11.52

export class Events
{
    /**
    the list of events provided to the constructor defines which events it can emit and accept listeners for
    @param {...string} events
    @example
    const events = new Events(
        'KOT_EVENT',
        'BIRB_EVENT',
        'SNEK_EVENT'
    )
    @readme ### **constructor**
    */

    constructor (...events)
    {
        for (const event of events)
        {
            this.__events[event] = []
        }
    }

    /**
    event handlers run after the event was was emitted via `.emit`<br>
    events can have multiple handlers. handlers run synchronously, in the same order they were added.<br>
    if the event was emitted with a payload, handlers receive it as their only argument. return values of handlers are discarded
    @callback eventHandler
    @param {*} [data]
    @returns {void|*}
    @example
    events.listen('KOT_EVENT', data => console.log(data ? `kot ${ data }.` : 'kot.'))
    events.emit('KOT_EVENT', 'meows') // 'kot meows.'
    events.emit('KOT_EVENT', 'barks') // 'kot barks.'
    events.emit('KOT_EVENT')          // 'kot.'
    @readme **event handlers**
    */

    /**
    internal null-prototype object that stores all event handlers
    @type {Object.<string, eventHandler[]>}
    @private
    */

    __events = Object.create(null)

    /**
    triggers all handlers attached to the event
    @param {string} event
    @param {*} [data]
    @throws if there's no such event
    @example
    events.listen('KOT_EVENT', data => console.log(data ? `kot ${ data }.` : 'kot.'))
    events.emit('KOT_EVENT', 'meows') // 'kot meows.'
    events.emit('KOT_EVENT', 'barks') // 'kot barks.'
    events.emit('KOT_EVENT')          // 'kot.'
    @readme ### `.emit(event, data?)`
    */

    emit (event, data)
    {
        if (!this.__events[event])
        {
            throw new Error(`no such event: ${ event }`)
        }

        for (const cb of this.__events[event])
        {
            cb(data)
        }
    }

    /**
    adds an event handler
    @param {string} event
    @param {eventHandler} handler
    @throws – if there's no such event
    @throws – if the handler is already attached to the event
    @example
    events.listen('KOT_EVENT', data => console.log(data ? `kot ${ data }.` : 'kot.'))
    events.emit('KOT_EVENT', 'meows') // 'kot meows.'
    events.emit('KOT_EVENT', 'barks') // 'kot barks.'
    events.emit('KOT_EVENT')          // 'kot.'
    @example
    componentDidMount () {
        events.listen('SOME_EVENT', this.doSomething)
    }
    componentWillUnmount () {
        events.unlisten('SOME_EVENT', this.doSomething)
    }
    @readme ### `.listen(event, handler)`
    */

    listen (event, handler)
    {
        if (!this.__events[event])
        {
            throw new Error(`no such event: ${ event }`)
        }

        if (this.__events[event].includes(handler))
        {
            throw new Error(`the handler is already attached to the event`)
        }

        this.__events[event].push(handler)
    }

    /**
    removes an event handler
    @param {string} event
    @param {eventHandler} handler
    @throws – if there's no such event
    @throws – if the handler is not attached to the event
    @example
    const kotEventHandler = () => console.log('kot.')
    events.listen('KOT_EVENT', kotEventHandler)
    // ...
    events.unlisten('KOT_EVENT', kotEventHandler)
    @example
    componentDidMount () {
        events.listen('SOME_EVENT', this.doSomething)
    }
    componentWillUnmount () {
        events.unlisten('SOME_EVENT', this.doSomething)
    }
    @readme ### `.unlisten(event, handler)`
    */

    unlisten (event, handler)
    {
        if (!this.__events[event])
        {
            throw new Error(`no such event: ${ event }`)
        }

        if (!this.__events[event].includes(handler))
        {
            throw new Error(`the handler is not attached to the event`)
        }

        this.__events[event].splice(this.__events[event].indexOf(handler), 1)
    }
}