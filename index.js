/**
 * let deku component be stateful
 * @param {Function} Component 
 */
function stateful(Component) {
  
  //Component as a function
  if(typeof Component === 'function'){
    Component = {render: Component}
  }

  let {shouldUpdate=() => {return true}} = Component

  //cache states
  let _states = {}
  //cache components
  let _components = {}
  // cache previous props and state
  let _previous = {}
  const INIT_TYPE = '_stateful_init_dispatch_type'
  /**
   * let options be with state.
   * @param {Object} options 
   */
  let model = function(options){
    let {path} = options
    let state = _states[path]
    return {...options, state}
  }

  let _updatePrevious = function({path, props}){
    let state = _states[path]
    _previous[path] = {..._previous[path], prevProps: props, prevState: state}
  }
  /**
   * run before render, do some initial operation
   * @param {Object}
   */
  let onBefore = function(options){
    let {path, props, dispatch} = options
    
    if(!Component.setState){
      Component.setState = (data) => {
        _states[path] = {..._states[path], ...data}
        return dispatch({..._states[path], type: INIT_TYPE})
      }
    }

    if(!_previous[path]){
      _previous[path] = {}
    }
    if(!_states[path]){
      //initial state and only run one time before render.
      if(Component.initialState){
        let s = Component.initialState({props, path})
        _states[path] = s || {}
      }
      if(props.state){
        _states[path] = {...state, ...props.state}
      }
      
      if(Component.onBefore){
        Component.onBefore({state, ...options})
      }

    }
  }

  /**
   * add state to onCreate
   * @param {Object} options 
   */
  let onCreate = function(options){
    if(Component.onCreate){
      return Component.onCreate(model(options))
    }
  }

  /**
   * add state to onCreate
   * @param {Object} options 
   */
  let onUpdate = function(options){
    let {path} = options, ret
    let md = model(options)
    let {prevProps, prevState} = _previous[path]
    if(Component.onUpdate && shouldUpdate && shouldUpdate({...md, prevProps, prevState})){
      ret = Component.onUpdate(md)
      //update previous props and state
      _updatePrevious(options)
    }
    return ret
  }
  
  /**
   * add shouldUpdate and onBefore to render
   * note that Component.onBefore only run one time.
   * @param {Object} options 
   */
  let render = function(options){
    onBefore(options)
    let {path, props, dispatch} = options
    let {setState} = Component
    let state = _states[path]
    let {prevProps, prevState} = _previous[path]
    //cache the component
    
    //you can optimise the app by using shouldUpdate
    if(!_components[path]){
      _components[path] = Component.render({...options, state, setState})
      //update previous props and state when create
      _updatePrevious(options)
    }else if(shouldUpdate && shouldUpdate({...options, state, prevProps, prevState})){
      _components[path] = Component.render({...options, state, setState})
    }

    
    
    return _components[path]
  }

  /**
   * reset cache when component removed
   * @param {Object} options 
   */
  let onRemove = function(options){
    let {path} = options
    if(Component.onRemove){
      Component.onRemove(model(options))
    }
    delete _states[path]
    delete _components[path]
    delete _previous[path]
  }

  


  return Object.assign({},
    Component, 
    {
      render,
      onUpdate,
      onCreate,
      onRemove
    })
}

export default stateful

