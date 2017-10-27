'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * let deku component be stateful
 * @param {Function} Component 
 */
function stateful(Component) {

  //Component as a function
  if (typeof Component === 'function') {
    Component = { render: Component };
  }

  var _Component = Component,
      _Component$shouldUpda = _Component.shouldUpdate,
      shouldUpdate = _Component$shouldUpda === undefined ? function () {
    return true;
  } : _Component$shouldUpda;

  //cache states

  var _states = {};
  //cache components
  var _components = {};
  // cache previous props and state
  var _previous = {};

  /**
   * let options be with state.
   * @param {Object} options 
   */
  var model = function model(options) {
    var path = options.path;

    var state = _states[path];
    return (0, _extends3.default)({}, options, { state: state });
  };
  /**
   * run before render, do some initial operation
   * @param {Object}
   */
  var onBefore = function onBefore(options) {
    var path = options.path,
        props = options.props,
        dispatch = options.dispatch;


    if (!Component.setState) {
      Component.setState = function (data) {
        _states[path] = data;
        return dispatch(_states[path]);
      };
    }

    if (!_previous[path]) {
      _previous[path] = {};
    }
    if (!_states[path]) {
      //initial state and only run one time before render.
      var state = _states[path] = {};
      if (Component.initialState) {
        var s = Component.initialState({ props: props, path: path });
        state = _states[path] = s || {};
      }
      if (props.state) {
        state = (0, _assign2.default)(state, props.state);
      }

      if (Component.onBefore) {
        Component.onBefore((0, _extends3.default)({ state: state }, options));
      }
    }
  };

  /**
   * add state to onCreate
   * @param {Object} options 
   */
  var onCreate = function onCreate(options) {
    if (Component.onCreate) {
      return Component.onCreate(model(options));
    }
  };

  /**
   * add state to onCreate
   * @param {Object} options 
   */
  var onUpdate = function onUpdate(options) {
    if (Component.onUpdate) {
      return Component.onUpdate(model(options));
    }
  };

  /**
   * add shouldUpdate and onBefore to render
   * note that Component.onBefore only run one time.
   * @param {Object} options 
   */
  var render = function render(options) {
    onBefore(options);
    var path = options.path,
        props = options.props,
        dispatch = options.dispatch;
    var _Component2 = Component,
        setState = _Component2.setState;

    var state = _states[path];
    var _previous$path = _previous[path],
        prevProps = _previous$path.prevProps,
        prevState = _previous$path.prevState;
    //cache the component

    //you can optimise the app by using shouldUpdate

    if (shouldUpdate && shouldUpdate((0, _extends3.default)({}, options, { state: state, prevProps: prevProps, prevState: prevState }))) {
      _components[path] = Component.render((0, _extends3.default)({}, options, { state: state, setState: setState }));
    } else {
      _components[path] = _components[path] || Component.render((0, _extends3.default)({}, options, { state: state, setState: setState }));
    }

    //update previous props and state
    _previous[path] = (0, _assign2.default)(_previous[path], { prevProps: props, prevState: state });

    return _components[path];
  };

  /**
   * reset cache when component removed
   * @param {Object} options 
   */
  var onRemove = function onRemove(options) {
    var path = options.path;

    if (Component.onRemove) {
      Component.onRemove(model(options));
    }
    delete _states[path];
    delete _components[path];
    delete _previous[path];
  };

  return (0, _assign2.default)({}, Component, { render: render,
    onUpdate: onUpdate,
    onCreate: onCreate,
    onRemove: onRemove });
}

exports.default = stateful;