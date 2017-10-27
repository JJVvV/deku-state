# deku-state 

Let Deku components keep state.

This is a factory component that add state to the Deku components.

## Install
```bash
npm install deku-state --save
```
## Example

```javascript

/** @jsx element */
import {element, createApp} from 'deku'
import stateful from './component/stateful.js'

let log = (setState, state) => (e) => {
  setState({show: !state.show})
}

let Wrapper = {
  render: ({ props, children, dispatch , state, setState}) => {
    return <div onClick={log(setState, state)}>{state.show? children:'button hide now'}</div>
  },

  shouldUpdate({state, props}){
    return true  
  },

  initialState({props}){
    return {
      show: props.show
    }
  },

  onBefore({state}){
    console.log('onBefore Wrapper', state)
  }

}

let Button = {
  render: ({ props, children, dispatch , state}) => {
    return <button>hello, {children}!</button>
  },
  
  onRemove({path, state}){
    console.log('onRemove Button', state)
  }

}

Wrapper = stateful(Wrapper)
Button = stateful(Button)

function dispatch(){
  render(
    <Wrapper show={true}><Button>button</Button></Wrapper>
  )
}

let render = createApp(document.body, dispatch)

dispatch()

```

## API

* setState({})
* shouldUpdate({props, state, prevProps, prevState}) control update by the return result.
* onBefore() run before render, only run one time.
* initialState({props}) initial state.

## Thanks

* [deku](https://github.com/anthonyshort/deku/issues/337)

## License

MIT