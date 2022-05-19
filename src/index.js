const path = require('path')
// const filename = path.basename(__filename)
// console.log(filename)
const message_maker = require('message-maker') // @TODO factor in but make an abstract-message tester
// const message_id = to => (outbox[to] = 1 + (outbox[to]||0))

/*
const path = require('path');
console.log(path.dirname(require.main.filename));
see https://stackoverflow.com/questions/50544723/how-to-get-the-root-of-project-which-installed-my-npm-module
let packagePath = path.dirname(require.resolve("moduleName/package.json"));
*/



// const labels = {}
// protocol_maker.remap = (path, label) => {
//   // an instance can ask a parent_wire factory for the subjective label of its factory
//   // ...
// }
// const node = protocol_maker(debug_protocol)

// var logger
// const sub = node.sub
// sub.debug = (log) => {
//  logger = log
// }

// 1. factory gets made
// 2. factory can make instances
// 3. instances can make sub wires
// 4. instances cannot accept super wires if factory is not connected

module.exports = protocol_maker

var counter = 0
const routes = {} // @TODO: ...ROUTES

// const credential = new Symbol('protocol-maker')

// function sub (protocol) {
//   return protocol_maker(protocol, { auth: credential })
// }
const files = {}

function protocol_maker ({ protocol, wires = {}, type = '(unknown)', opts = {} } = {}) {
  if (!type || typeof type !== 'string') throw new Error('invalid type')
  const node_address = counter++
  const make_message = message_maker(node_address)

  const inbox = {} // @TODO: option to save/restore in/from hypercores
  const outbox = {} // @TODO: option to save/restore in/from hypercores

  const _contacts = {
    by_id: {},
    by_address: {},
    by_route: {}, // @TODO: ... ROUTES
  }
  const by = {
    id: id => _contacts.by_id[id],
    address: address => _contacts.by_address[address],
    route: route => {
      const routes = Object.keys(_contacts.by_route)
      // @TODO: ... ROUTES
    }
  }
  const contacts = { add, group, cut, by }
  const node = wrap_notify(protocol)
  Object.assign(node, { $: node, address: node_address, contacts,/* sub,*/ type, on, opts })

  // @TODO: ... ROUTES
  const path = new Error().stack.split('\n')[2].split('(')[1].split(':')[0]
  // .split('.')[0].toUpperCase()
  files[node_address] = path


  const ids = Object.keys(wires)
  const wrapped_protocol = wrap_protocol(protocol)
  for (var i = 0, len = ids.length; i < len; i++) { // @INFO: perspective of SUB instance:
    const id = ids[i] // nickid an instance gives to incoming connection (e.g. parent)
    const wire = wires[id]
    // @TODO: address: maybe something new, based on e.g. filepath or browserified bundle.js:22:42 etc.. to give actual globally unique identifier
    const { notify, address: to, id: label } = wire({ address: node_address, notify: wrapped_protocol })
    if (files[to] === path) {
      console.log('same')
    } else {
      console.log('different')
    }
    console.log(`
      ${files[to]}
      =>
      ${path}
    `)

    // @TODO: ... ROUTES (e.g. store "path")

    const contact = { id, address: to, /* path: `${address}/${id}`, */ notify: wrap_notify(notify) }
    const { by_id, by_address } = _contacts
    by_id[id] = by_address[to] = contact // new Promise(resolve => resolve(contact))
  }
  
  return node

  function add (id, pubkey) {
    if (!id || typeof id !== 'string') throw new Error('invalid id')
    if (id[0] === '$') throw new Error('id must not start with "$" character')
    return make(id, pubkey) 
  }
  function group (id, wire) {
    if (!id || typeof id !== 'string') throw new Error('invalid id')
    if (id[0] === '$') throw new Error('id must not start with "$" character')
    if (id[0] === '@') throw new Error('id must not start with "@" character')
    if (id[0] === '#') throw new Error('id must not start with "#" character')
    if (id[0] === '_') throw new Error('id must not start with "_" character')
    if (Number.isInteger(Number(id[0]))) throw new Error('id must not start with a number')
    const counter = 0
    return () => make(`$${id}-${counter++}`)
  }
  /* ROUTING:
  1. pub/sub on topic addresses?
  2. network communication is encrypted
  3. app encryption, so msg to unlock door can go via light bulb, but lightbulb cant
  4. flooding is most simple => just broadcast to everyone and everyone to everyone
    * dont forward messages recently seen
    * dont go over too many hops
  5. always on devices can store msgs to forward when sender is offline
    * The friend node maintains a cache that stores all incoming messages addressed
    * to the low-power node and delivers those messages to the low-power node
    * when requested. In addition, the friend node delivers security updates
    * to the low-power node.
  6. 
  
  */
  function make (id, pubkey) { // @INFO: perspective of CONTAINER instance:
    const { by_id, by_address } = _contacts
    if (by_id[id]) throw new Error('id already exists')
    by_id[id] = true // nickid an instance gives to initiated connection
    return function wire ({ address, notify }) {
      if (by_address[address]) throw new Error('address already exists')


      console.log(node_address, 'adds', address, 'as', id)
      // @TODO: ... ROUTES
      // queryable "routes" to allow lookup `address_route = by_route(ids_route)`
      // console.log(address_route, ids_route) // [2,5,7,16], ['foo','bar','baz','beep']
      
      const contact = wrap_notify(notify)
      Object.assign(contact, { $: contact, id, address })
      by_id[id] = by_address[address] = contact
      return { notify: wrap_protocol(protocol), address, label: id }
    }
  }
  /*
    const id_routes = [
      "root/",
      "root/el:demo/",
      "root/el:demo/cpu:range-slider/",
      "root/el:demo/cpu:range-slider/%:input-number/",
      "root/el:demo/ram:range-slider/",
      "root/el:demo/ram:range-slider/GB:input-number/",
      "root/el:demo/upload:range-slider/",
      "root/el:demo/upload:range-slider/MB:input-number/",
      "root/el:demo/download:range-slider/",
      "root/el:demo/download:range-slider/MB:input-number/",  
    ]
    // --------------------------------------------------
    const id_routes = {
        root: {
            "el:demo": {
                "cpu:range-slider": {
                    "%:input-number": {}
                },
                "ram:range-slider": {
                    "GB:input-number": {}
                },
                "download:range-slider": {
                    "MB:input-number": {}
                },
                "upload:range-slider": {
                    "MB:input-number": {}
                },
            },
        },
    }
    // --------------------------------------------------
    const id_routes = {
        root: {
            "el": {
                "cpu": {
                    "%": {}
                },
                "ram": {
                    "GB": {}
                },
                "download": {
                    "MB": {}
                },
                "upload": {
                    "MB": {}
                },
            },
        },
    }
  */
  function wrap_notify (notify) {
    if (typeof notify !== 'function') throw new Error(`notify is not a function`)
    return async data => { // async, so storing in hypercore can be awaited
      if (!data) data = { type: 'ping' }
      if (typeof data === 'string') data = { type: 'data', data }
      if (!data.to) data.to = node_address
      switch (data.to) {
        case node_address: {
          const message = make_message(data)
          outbox[message.head.join('/')] = message  // store message
          await notify(message)
          return message
        }
        default: {
          throw new Error('@TODO forward to the right recipient')
        }
      }
    }
  }
  function wrap_protocol (protocol) {
    if (typeof protocol !== 'function') throw new Error(`protocol is not a function`)
    return async message => { // async so message processing can be awaited
      // @TODO: maybe protocol to some messages and handle them by default, e.g. `connect` and `disconnect` and
      // then let user know anyway ...or via .on() ...but maybe also just via `protocol(message)`
      inbox[message.head.join('/')] = message  // store message
      return await protocol(message)
    }
  }
  function on (protocoler) {
    // @NOTE: to protocol to any "default protocol events" supported by any protocol, e.g. help
    // maybe also: 'connect', or 'disconnect'
    throw new Error ('`on` is not yet implemented')
    return function off () {}
  }
  function cut (wire) { throw new Error ('`cut` is not yet implemented')}
}
