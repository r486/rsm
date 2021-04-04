use the store only for properties shared between components

### setup

```
import { Store } from '../somewhere/store.js'

export const store = new Store({
    $volume: 100,
    // ...
})
```

then import it in every file that uses it

### get

#### on demand

```
const volume = store.get('$volume')
```

#### on change

```
doSomethingWithVolume = (current, previous) =>
{
    // ...
}

componentDidMount ()
{
    store.sub('$volume', this.doSomethingWithVolume)
}

componentWillUnmount ()
{
    store.unsub('$volume', this.doSomethingWithVolume)
}
```

the method passed to `.sub`/`.unsub` must be an arrow function or be wrapped in one.\
`.unsub` is unnecessary if the component is persistent

### set

#### get by any, set by one

in this case, it is possible to just copy the property into component state and propagate changes to the store

```
state = { volume: store.get('$volume') }

render ()
{
    return (
        <input 
            // ...
            value={ this.state.volume } 
            onChange={ e => this.setState({ volume: e.target.value }) }
        />
    )
}

componentDidUpdate ()
{
    store.set('$volume', this.state.volume)
}
```

#### get by any, set by many

e.g. a value that gets set by a field, a slider, a button and a bunch of other things

each of them needs to subscribe to the property, and there's no point copying it to local state

```
render ()
{
    return (
        <input 
            // ...
            value={ store.get('$volume') } 
            onChange={ e => store.set('$volume', e.target.value) }
        </input>
    )
}

componentDidMount ()
{
    store.sub('$volume', () => this.forceUpdate())
}
```

<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>
<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>
<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>
<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>
<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>
<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>
<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>
<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>
<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>

## hack

```
import { Store } from '../somewhere/store.js'

export const store = new Store({
    $foo: null,
    $bar: null,
    // ...
})
```

`Foo`

```
state = {
    // two dozen god damn props
}

// ...

componentDidMount ()
{
    store.set('$foo', { ...this.state })
}

componentDidUpdate ()
{
    store.set('$foo', { ...this.state })
}
```

`Bar`

```
state = {
    // another dozen god damn props
}

// ...

componentDidMount ()
{
    store.set('$bar', { ...this.state })
}

componentDidUpdate ()
{
    store.set('$bar', { ...this.state })
}
```

`FooBar`

```
render ()
{
    const { $foo, $bar } = store.getx()
    if (!$foo || !$bar) return <div><Spinner/></div>
    
    // ...
}

componentDidMount()
{
    store.sub('$foo', () => this.forceUpdate())
    store.sub('$bar', () => this.forceUpdate())
}
```

:^)