// const path = require('path')
// const filename = path.basename(__filename)
const message_maker = require('message-maker')
// const message_id = to => (outbox[to] = 1 + (outbox[to]||0))

module.exports = protocol_maker

const routes = {}
var id = 0

function protocol_maker (type, listen, initial_contacts = {}) {
  if (!type || typeof type !== 'string') throw new Error('invalid type')
  const myaddress = id++

  const inbox = {}
  const outbox = {}

  const by_name = {}
  const by_address = {}
  const contacts = { add, by_name, by_address, cut, on }
  
  const keys = Object.keys(initial_contacts)
  for (var i = 0, len = keys.length; i < len; i++) {
    const name = keys[i]
    const wire = initial_contacts[name]
    // @INFO: perspective of sub instance:
    const { notify, address } = wire(myaddress, wrap_listen(listen))    
    const contact = {
      name,
      address,
      // path: `${myaddress}/${name}`,
      notify: wrap_notify(notify),
      make: message_maker(myaddress)
    }
    by_name[name] = by_address[address] = contact // new Promise(resolve => resolve(contact))
  }
  return contacts
  function on (listener) {
    // @NOTE: to listen to any "default protocol events" supported by any protocol, e.g. help
    // maybe also: 'connect', or 'disconnect'
    throw new Error ('`on` is not yet implemented')
    return function off () {}
  }
  function cut (wire) { throw new Error ('`cut` is not yet implemented')}
  function add (name) {
    // @INFO: perspective of instance:
    if (!name || typeof name !== 'string') throw new Error('invalid name')
    if (by_name[name]) throw new Error('name already exists')
    const wait = {}
    by_name[name] = { name, make: message_maker(myaddress) } // new Promise((resolve, reject) => { wait.resolve = resolve; wait.reject = reject })
    return function wire (address, notify) {
      const contact = {
        // @TODO: add queryable "routes" and allow lookup `by_route[route]`       
        name, // a nickname dev gives to a component
        address, // an address app makes for each component
        // TODO: address will become "name" (like type) compared to nickname
        // address: something new, based on e.g. filepath or browserified bundle.js:22:42 etc.. to give actual globally unique identifier
        notify: wrap_notify(notify),
        make: message_maker(myaddress)
      }
      // wait.resolve(contact)
      by_name[name].address = address
      by_name[name].notify = wrap_notify(notify)
      by_address[address] = contact // new Promise(resolve => resolve(contact))
      return { notify: wrap_listen(listen), address: myaddress }
    }
  }
  function wrap_notify (notify) {
    return message => {
      outbox[message.head.join('/')] = message  // store message
      return notify(message)
    }
  }
  function wrap_listen (listen) {
    return message => {
      inbox[message.head.join('/')] = message  // store message
      return listen(message)
    }
  }
}
/*
const name_routes = [
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
const name_routes = {
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
const name_routes = {
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