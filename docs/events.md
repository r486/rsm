# Events

generic event emitter with barebone API

it's pretty much just this:

```ecmascript 6
{
    KOT_EVENT:  [fn],
    BIRB_EVENT: [fn],
    SNEK_EVENT: [fn, fn, fn, fn, fn, fn, fn, fn]
}
```

so entities listen for an event by providing a handler function that will be called every time `.emit` is called with that event

## hello world

```ecmascript 6
const events = new Events(
    'KOT_EVENT',
    'BIRB_EVENT',
    'SNEK_EVENT'
)
```

* listen

```ecmascript 6
events.listen('KOT_EVENT', data => console.log(data ? `kot ${ data }s.` : 'kot.'))
events.listen('BIRB_EVENT', data => console.log(data ? `birb ${ data }s.` : 'birb.'))

events.listen('SNEK_EVENT', () => console.log('Welcome to my world, or should I say this land of snakes?'))
events.listen('SNEK_EVENT', () => console.log('Serpents lie and wait'))
events.listen('SNEK_EVENT', () => console.log('At every take my knees quake'))
events.listen('SNEK_EVENT', () => console.log('As my life these snakes invade'))
events.listen('SNEK_EVENT', () => console.log('Snake invaders show their fangs'))
events.listen('SNEK_EVENT', () => console.log('On the snake parade'))
```

* emit

```ecmascript 6
events.emit('KOT_EVENT')           // 'kot.'
events.emit('KOT_EVENT', 'meow')   // 'kot meows.'
events.emit('BIRB_EVENT', 'chirp') // 'birb chirps.'
events.emit('SNEK_EVENT')          // the handlers will be called in that order every time. youtu.be/nMSujTB-SG4
```

## API

all methods are synchronous


### **constructor**

```
@param {...string} events
```

the list of events provided to the constructor defines which events it can emit and accept listeners for
```
const events = new Events(
    'KOT_EVENT',
    'BIRB_EVENT',
    'SNEK_EVENT'
)
```


**event handlers**

```
@callback eventHandler
@param {*} [data]
@returns {void|*}
```

event handlers run after the event was was emitted via `.emit`<br>
events can have multiple handlers. handlers run synchronously, in the same order they were added.<br>
if the event was emitted with a payload, handlers receive it as their only argument. return values of handlers are discarded
```
events.listen('KOT_EVENT', data => console.log(data ? `kot ${ data }.` : 'kot.'))
events.emit('KOT_EVENT', 'meows') // 'kot meows.'
events.emit('KOT_EVENT', 'barks') // 'kot barks.'
events.emit('KOT_EVENT')          // 'kot.'
```


### `.emit(event, data?)`

```
@param {string} event
@param {*} [data]
@throws if there's no such event
```

triggers all handlers attached to the event
```
events.listen('KOT_EVENT', data => console.log(data ? `kot ${ data }.` : 'kot.'))
events.emit('KOT_EVENT', 'meows') // 'kot meows.'
events.emit('KOT_EVENT', 'barks') // 'kot barks.'
events.emit('KOT_EVENT')          // 'kot.'
```


### `.listen(event, handler)`

```
@param {string} event
@param {eventHandler} handler
@throws – if there's no such event
@throws – if the handler is already attached to the event
```

adds an event handler
```
events.listen('KOT_EVENT', data => console.log(data ? `kot ${ data }.` : 'kot.'))
events.emit('KOT_EVENT', 'meows') // 'kot meows.'
events.emit('KOT_EVENT', 'barks') // 'kot barks.'
events.emit('KOT_EVENT')          // 'kot.'
```

```
componentDidMount () {
    events.listen('SOME_EVENT', this.doSomething)
}
componentWillUnmount () {
    events.unlisten('SOME_EVENT', this.doSomething)
}
```


### `.unlisten(event, handler)`

```
@param {string} event
@param {eventHandler} handler
@throws – if there's no such event
@throws – if the handler is not attached to the event
```

removes an event handler
```
const kotEventHandler = () => console.log('kot.')
events.listen('KOT_EVENT', kotEventHandler)
// ...
events.unlisten('KOT_EVENT', kotEventHandler)
```

```
componentDidMount () {
    events.listen('SOME_EVENT', this.doSomething)
}
componentWillUnmount () {
    events.unlisten('SOME_EVENT', this.doSomething)
}
```

