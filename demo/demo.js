const a = require('a')
const b = require('b')
const protocol_maker = require('..')
const my_protocol = require('_my-protocol')

const sdk = () => api
const node = protocol_maker({ protocol: my_protocol(sdk) })
const api = { log: sdk.log }

function demo () {
  const $demo = protocol_maker({
    protocol, wires: { 'factory': node.contacts.add('demo') }
  })
  const { contacts /*, type, sub, on, opts*/ } = $demo

  const opts = {}
  b(opts, contacts.add('b'))
  a(opts, contacts.add('a'))


  $demo('foo')

  return

  function protocol (msg) {
    api.log('[instance]', msg)
  }
}

node('initialized')

demo()

console.log('DONE')
node('asdf')

// 

// const {
//   contacts: { add, group, cut, by },
//   sub,
//   type,
//   on,
//   opts
// } = node

// const 
