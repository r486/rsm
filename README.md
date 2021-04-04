## [Store](https://github.com/r1vn/rsm/blob/master/docs/store.md#api)

```
store = new Store(props) 
store.sub(key, handler)   // adds a property handler
store.unsub(key, handler) // removes a property handler
store.get(key)            // gets the value of the property
store.getx(...keys)       // gets multiple properties
store.set(key, value)     // sets the value of the property directly then triggers its handlers
store.setx(props)         // sets multiple properties then triggers their handlers
store.alt(key, fn)        // sets the value of the property via function then triggers its handlers
```

## [Events](https://github.com/r1vn/rsm/blob/master/docs/events.md#api)

```
events = new Events(...events)
events.listen(event, handler)   // adds an event handler
events.emit(event, data?)       // triggers all handlers listening for the event
events.unlisten(event, handler) // removes an event handler
```

## setup

### with build tools

save [store.js](https://raw.githubusercontent.com/r1vn/rsm/master/store.js) and/or
[events.js](https://raw.githubusercontent.com/r1vn/rsm/master/events.js)
somewhere it's convenient to import them from.\
then you can do something like this

```ecmascript 6
import { Store } from './somewhere/store'
import { Events } from './somewhere/events'

export const store = new Store({ 
    // ...
})
export const events = new Events(
    // ...
)
```

and import the instances where you need them

### without build tools

paste the contents of [store.min.js](https://raw.githubusercontent.com/r1vn/rsm/master/dist/store.min.js) and/or
[events.min.js](https://raw.githubusercontent.com/r1vn/rsm/master/dist/events.min.js) somewhere.\
the minified files expose `Store` and `Events` as window globals