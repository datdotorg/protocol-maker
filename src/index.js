// const path = require('path')
// const filename = path.basename(__filename)
const message_maker = require('message-maker')

module.exports = protocol_maker

var id = 0

function protocol_maker (myaddress, listen, contacts = {}) {
  const inbox = {}
  const outbox = {}
  const recipients = {}
  const names = {}
  const message_id = to => (outbox[to] = 1 + (outbox[to]||0))
  
  const keys = Object.keys(contacts)
  for (var i = 0, len = keys.length; i < len; i++) {
    const name = keys[i]
    const protocol = contacts[name]

    const {notify, address} = protocol(myaddress, wrap_listen(listen))
    names[address] = recipients[name] = {
      name,
      address,
      notify: wrap_notify(notify),
      make: message_maker(myaddress)
    }
  }
  
  function make_protocol (name) {
    return function protocol (address, notify) {
      names[address] = recipients[name] = {
        name,
        address,
        notify: wrap_notify(notify),
        make: message_maker(myaddress)
      }
      return { notify: wrap_listen(listen), address: myaddress }
    }
  }
  
  return { make_protocol, names, recipients, outbox }

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