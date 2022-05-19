
const {
  autor: from,
  id: to,
  sequence: msg_id,
  content: data,
} = message



// explicitly say which peers we are replicating with
ebt.request('alice', true)
ebt.request('bob', true)


var stream = ebt.createStream('bob', version=3, isClient = true)
stream.pipe(remote_stream).pipe(stream)


opts = {
  id: string,
  timeout: 3000, //default, //  is used to decide when to switch a feed to another peer. essential to detect when peer stalls
  getClock: function (id, cb),
  setClock: function (id, clock),
  getAt: function ({id:string, sequence:number}, cb),
  append: function (msg, cb),
  isFeed: function (id),
  isMsg: function(data),
  getMsgAuthor: function(msg),
  getMsgSequence: function(msg)
}



names/ids/addresses, are FEEDS

add means follow feed
cut means unfollow feed



ebt.progress() // { start: 'where we started', current: 'operations done', total: 'operations expected' }


ebt.state // state of replication available here
// read only access is ok, but updating should be done via ebt methods

const state = {
  id,
  clock,  // id + clock could be our feed
  follows: { <id>:<bool> }, // contacts subscribed to
  blocks: { <id>: { <id>: <bool> } }, // who blocks who
  peers: {
    <id>: {
      clock, // feed we know the peer is up to -1
      msgs,  // pending outbox
      retrieve, // ids of feeds ready for next msg
      notes, // encoded vector clocks to be sent
      replicating: { // feeds being replicated to peer
        <id>: { 
          rx: <bool> // true if we have asked to receive this feed
          tx: <bool> // true if we have been asked to send this feed
          sent: <seq|-1|null>, // seq number of message we sent
          requested: <seq|-1|null>, // seq number remote peer asked for
        }
      }
  },
  receive: [<msg>] // incoming msgs queue
}



When a peer connects, the server receiving the request is expected to send their vector clock first

it should use a local chace as the last known status of the client

notes should only contain ffeeds changed since their last exchange (request skipping)
this ensures notes are as small as possible


when connecting to multiple peers, only request new messages using rx for a feed from one of the nodes


following and blocking are handled in EBT
follow acts as signals of what feeds to replicate
EBT wont connect to someone that has been blocked
it will not send messages of a peer to another peer if hte first peer blocks the second

-----------------------------------------------------------



avoid retransmitting messages by putting unneeded connections into standby (can bring back later)


send msgs in order


plumbtree is solely a broadcast protocol
not eventually consistent replication protocol

tree construction/maintanance
peer sampling



-----------------------------------------------------------
SCION:

ISOLATION DOMAIN
=> a bunch of network nodes that communicate mainly interanlly

allows to route your traffice just via trusted networks

path selection capability
also by using multiple paths simultaneously
or rapidely switching paths (e.g. when issue occurs on one route between two end hosts)
=> fast failover




-----------------------------------------------------------
NDN:
named data vs ip addresses

lower layer adapts to underlying physical chain links and communications
obtaining data based on name instead of pushing data based on IP locations
upper layer responds to related applications

instead of doing server side push of data
NDN does a demand-pull of data


interest packet
data packet



-----------------------------------------------------------
SEGMENT NETWORKING:

RFC 8402

Todays Challenges

Segment Routing + building blocks
- prefix SID
- adjacency SID

topology independent LFA (Ti-LFA)

Segment Routing Traffic Engineering
- PCE Controller


Use Cases







-----------------------------------------------------------
SEGMENT NETWORKING: (stuff marketing doesnt talk about it)

SID = Segment ID = Segment Identifier
SR = Segment Routes (search/replace)
enable an SR to include another SR by reference
=> useful to scale the SID stack at ingress

SID list = forwarding stack

Segment Routing in a flash
1. Segment Types and label spaces
  * adjacency SID (single router hop)
    * represents IGP adjecency
    * node-local significance
  * prefix SID (one or more hops)
    * represents IGP least cost path to prefix
    * node-SIDs are special form of prefix-SIDs bount to loopback
  * domain-wide significance
2. ADVANCED SEGMENT TYPES (allow load balancing and redundancy in the network)
  * anycast-SID (one or more hops) (often used for geographically close set of nodes)
    * represents IGP least cost path to a non-uniquely announced prefix
  * binding-SID
    * represents a tunnel ( label a path of SIDs, search and replace style, to shorten routes )
3. SEGMENT ID (SID) SPACE
  * SIDs are not labels
    * but SIDs are encoded (carried) in labels
  * domain wide SIDs coordinated via IGP
  * domain-wide SIDs are allocated in a manner much like RFC 1918 addresses
    * each node reserves a block of labels, this label block is the segmented routing global block (SRGB)
    * global label = SRGB based value + index
  * => pop binding SID-label
  * => push SID list





Obvious Things
- lable managepent (space and stacks)
- RSVP-TE and SR coexistance/migration

less obvious things
- controller care and feeding
- SRTE protocols
- traffic protection

summary



LABEL STACK SIZE
=> segment routing provides for very granular traffic control,
where the controller does explicit path specification with a combination of
global and/or interface specific labels on the head of the packet
sounds great - carries additional considerations


hardware encapsulation capabilities - some hardware is severely constrianed as
to the number of labels that can be imposed in a single pass
* includes some popular chipsets
* if you control on end of the connection you may be able to offload some label imposition processing to your host stack
* if you are a transit/network provider pay careful attention to the ingress edge hardware capabilities
* if you need very specific traffic engineering capabilities (read link-specific placement) htis is a notable consideration


route hashing maybe?




RSVP-TE => point-to-point






CONTROLLER + COLLECTOR
1. controller acquires LSDB
  * passive IGP / BGP-LS / telemetry
2. controller understands current network state and utilization via collector
3. calculates traffic demands vs. capacity and availability requirement
  * understands h/w capabilities
  * aware of current and projected loads
4. controller sends segment list (path) to ingress router to place traffic
  * configuration / BGP SRTE / PCEP
  * other RIB programming mechanicsms


business logic
workload demands
availability requirements
network capabilities



SEGMENT ROUTING
* makes traffic engineering now primarily controllre driven
  * 

off-box/on-box label stack compression
=> 





RSVP Resource Reserveation Protocol





SEGMENT ROUTED LSPs
node segments
adjecency segments
prefix segments

eac segment is assigned a Segment ID value and IGP distributed the segmetn iD vlaues



INGRESS (data enters a network)
SR path (the path from data entering via ingress node until leaving via egress node)
  * can follow the leaves cost path
  * can follow other paths to avoid e.g. congestion
EGRESS (data leaves a network)



-------------
OPERATIONS


PUSH: insert a segment at the head of segment list
NEXT: active segment is completed, next segment becomes active
CONTINUE: active segment is not completed, hence it remains active




step1
many types of somehow connected service endpoints in the network

step2
PE (path element) makes PCreq (=path computation request)
or makes PCrpt (=path computation status report)

step3
PCE downloads paths for tunnel set
PE binds services to path


step4
PCE monitors and reoptimizes tunnels as required
PE performs make before break and moves to new path




-------------
SEGMENT ROUTING
Services: BGP-EVPN
Transport: IGP/SR  ==> DISTRIBUTE the Labels
 e.g. IS-IS
 e.g. OSPF
 * IGP's with additional headers 
IP: for connectivity


The SOURCE chooses a path and encodes it in the PACKET HEADER as an ORDERED LIST OF SEGMENTS
* SOURCE knows a "MAP" of the network

* SEGMENT (= identifier for any type of instruction)
  * e.g. "go to node N using the shortest path

Path Options:
1. Dynamic (Headend computation)
2. Explicit (Operator/Controller)

Control Pane
1. Routing protocols wit hextesnsions (IS-IS, OSPF, BGP)
2. SDN controller

Data Plane
1. MPLS (segment labels)
2. IPv6 (+SR header)


Status Quo and Legacy Routing:
=> Destination Based (e.g. routers need to know how to best forward things towards destination)

Source based Routing
=> Source chooses the path



PREFIX-ID (Prefix Segment) = Node or Anycast SID
=> Identifies node/router itself as a loopback interface 
=> globally significant

ADJACENCY ID
=> locally significant
=> Dynamically assigned (based on a Nodes physical link)


PROBLEM:
the PREFIX-IDs will go based on what nodes know directly
but with adjecency segment ID a node that knows a specific node is down
=> can force other routers to forward over specific physical links


TUNNEL:
=> all the nodes on a tunnel route have to be signalled
==> Binding SID (identifier of SR-Tunnel, called SR-policy)
===> a packet with BSD => routers on the way know how to behave in that case

SR-PCE => controller to calculate the path

ALGOS:
FlexAlgo



process EGRESS nodes
process INGRESS nodes










Segment Routing - Prefix Segment ID
=> Shortest path to IGP prefix (equal cost multipath ECMP-aware)
=> GLobal Segment (global significance
=> Label 16000 - 24000 )default SRGB)
=> statically assigned
=> distributed by ISIS/OSPF




get PROCESS ID
get database to load again stuff

User pubkey
App
session storage ID
node label

https://stackoverflow.com/a/36807854
https://stackoverflow.com/a/67158758








------------------------------------------------------------------------------
SEGMENT ROUTING .... alternative name: SPRING ROUTING

1. Tunneling technology (encapsulates packet within a header - onion)
2. Traffic Engineering technology (allows a router to steer trafic along an SR path)
   * path can be different from least cost path
3. innovative new applications to be discovered



SR segment (connects two points within the SR domain)
 * can traverse one or more router hops
 * is represented by SID (segment identifier)
SID
 * identifies path fragment that a packet follows
 * can have node-local or domain-wide (=global) significance

ingress nodes and ingress nodes of SR Domain




@THOUGHT
if there are no GLOBAL NAMES
a relative PATH is all i have to identify a node
its also descriptive and meaningful



TRADITIONAL APPROACHES:
1. encode path info in packet by enumeratin every hop
* no path info stored in network (e.g. IPv4 with strict source routing option)

2. Store path information in network
* packet header contains exactly one path identifier
* no further path information is encoded in packet (e.g. RSVP-signaled MPLS)

3. Hybrid: list all segments but not all nodes
  1. path is devided into segments (segment contains 1+ router hops
  2. packet header enumerates each segment in path
    * but does not enumerate every node
  3. network contains enough state to forward the packet (INGRESS NODES)
    * from INGRESS of segment to EGRESS of segment
  4. e.g. ipv4 loose source routing option
     e.g. ipv6 routing extenision header
     e.g. segment routing

* ingress node has info 


NODE = {
  ids: {
    pubkey: 'member of wide network', // translator key
    internal_node_name,
  }
  peerkeys: [], // all pubkeys connected to
  internal_segment_network: [],
}

internal segments dont know "pubkeys"
ingress/egress nodes speak both, pubkeys and internals
a node talking to internal needsto connect to pubkey + internal path
a node talking to others can get forwarded via ingress/egress of current NODE
internal node speaking members need to know ingress/egress that represent magically a different pubkey network



SR defines segment types that
=> traverse one router hop
=> traverse multiple router hops
SR header enumerates segments (not not necessarily each node)
Network contains enough info to route a package through a multi-hop segment



Basic Segment Types
1. Adjecency (single router hop) - LINK
  * represents an IGP adjacency
2. Prefix (one or more hops) - 
  * represents IGP least cost path to prefix
3. Anycast (one or more hops) - closest instance of that path
  * represents IGP least cost pat to a non-unique prefix
4. Binding
  * represents a tunnel (e.g. RSVP-signaled LSP)



SEGMENT LABEL STACK (SLS)
1. ingress node imposes a label stack
2. each label leads to the endpoint of a segment
3. network hsa info to get from segment to segment


---------------------------------
Data Plane: POP, PUSH, SWAP
Transport Plane:


---------------------------------
SCION:
1. zero conf mechanisum (to get IP+port) of bootstrapping server
2. bootstrapping server gives configuration - simple file server (TRC + topology infos)
3. end host machine (fetches from bootstrapping server)


use encryption to only reveal the next path segment to the next node in the line
and not send it on by default in the protocol



BGP casues problems
Routing casues problems
network stack causes problems because 50 years ago OSI model

1. route control
  * status quo: end users can only specify destination, nothing else
2. failure isolation
  * status quo: 
3. explicit trust information
4. end-to-end communication


end host selects path from given options != source routing)
  * because you select the entire path
routers just follow instructions
ISP policies enforced (user cannot invent paths)


Isolation Domains (ISDs)
1. an ISD is connected but SOVEREIGN
2. ISD independently chooses policies
3. trust + routing in an ISD are independent


SCION
1. Scalability (routers are stateless, hierarchical routing)
2. Native multipath
3. fault tolerance
  * control plane (the usual)
  * DIY: if path stops working, just switch to another one => instant

---------------------------------
SCION


1. when router gets a packet it needs to find its hop in packet header path by following a pointer in the header
2. verify some cryptographic information
3. increment the pointer and send forward
4. each node repeats: crypto, increment pointer, send forward



----------------------------
BROADCAST ALGORITHMS:
1. make best effort reliably by retransmitting dropped messages (wait for ack?)
2. enforce delivery order n top of reliable broadcast

EAGER RELIABLE BROADCAST:
everyone is flooding
works reliable
quite noisy/expensive

GOSSIP/EPIDEMIC PROTOCOLS:
forward to 3+ nodes chosen randomly

send to topic/pubkey is reliable
with pinning
get data later



1. cross process based on pubkeys is solved
2. inside process is always available unless e.g. an element disappears
   * but message delivery is done SYNC? ...if so no problem ever
3. between processes controlled by different pubkeys => goes via hyper bridge
4. between processes controlled by same key via wallet
5. 



----------------------------
to choose an address or path to a destination:

1. we need to let the network figure out
2. or we define it, but
  * we need a map of whats possible to search
  * what do we do when th path fails?

Laptop makes decisions for how network delivers

1. route control (path control)
  * end host selects path (puts it onto the packet header) => routing tables can be small even though packets get a bit bigger
    * => no routing tables
    * => routers are stateless
    * => hierarchical routing
  * routers just follow instructions
    * => but needs a set of allowed paths
    * ==> very fast MAC to check on routers if path came from ISP who has private key
      * you cannot create arbitrary paths
      * you can only use the things given to you by the ISP
    * native multipath => by just writing different paths to destination on different packets
  * ISP policies enforced (users cannot "invent" paths)
      * ISD (Isolation Domain) is connected but sovereign
      * ISD independently chooses policies
      * trust + routing in an ISD are independent
      * 
2. failure isolation
  * faault tolerance: control plane as usual
  * DIY + if paths stops working, switch instant to another
3. explicit trust information
  * ...
4. end-to-end communication
  * ...


------------------------------------
SCION Project (Scalability, Control, Isolation On Next /  Generation Networks)

* high availability (event for networks with malicious parties)
  * communication should be available if adversary-free paths exists
  * adversary: access to maangement plane of router
* secure entity authentication that scales to global heterogenous (dis)trusted envioronment
* operation transparency (clear what is happening to packets and whom needst obe relied upon for operation)
* balanced control (among ISPs, Senders and Receivers)
* Scalability, efficiency, flexibility



SCION Isolation Domains (ISD)
  1. Region which can agree on a common root of trust
  2. Set of ISPs to operate Isolation DOmain Core to manage ISD
    * root of trust and autonomous domain (AD) certificates
    * manage core path and beacon servers
  3. Other ISDs need to agree to connect as peers or as a provider in case of hierarchical ISD

Open Research Issue exactly how to best structure ISDs: Political and legal issues arise
  * possible partition is along geogrpahical regions

* ISD Core with ISD Core ADs
* Other ISP ADs or end0-domain ADs


ISD Core

ISD Core

--------
--------
BGP - Border Gateway Protocol

path vector protocol

exchange routing advertisments between peers

x->AS0

AS0->AS4, AS2
AS4->AS0, AS2, AS1
AS2->AS0, AS4, AS1, AS1
AS1->AS4, AS2, AS2, AS3, AS5
AS3->AS1, AS5, www
AS5->AS1, AS3

path(x,www): e.g. x->AS0->AS2->AS1->AS3->www


BGP: looks at autonomous system hops, not router hops
AS (autonomous systems) can be quite large or small

advertise routes

BGP: how to take a packet and transmit it further along the internet



--------
--------


Beaconing for ROute Discovery
1. Periodic Path Construction Beacon (PCBs)
  * Scalable & secure dissemination of path/topological information from core to edge
  * K-wise multi-path flood to provide multiple paths


--------

Who should control Paths?
* Source Routing has full control but gives attack surface too
* Limited amount of control would be good
  * path control enables traffic load balancing
  * without path control there is no multi-path communication
  * no optimization of networking paths for sender and receiver
  * poor availability (outages cannot be circumvented)
    * connection can suddenly break
  * traffic redication attacks become possible
* path transparency
  * today, sender cannot obtain guarantees a packet wirll travel along intended path
  * impossible to gain assurance of packet path
    * because router forwarding state can be different from routing messages received
  * trust transparency
    * today we cannot enumerate trust roots we rely upon
* secure end2end comm
  * fake certificate lead to attack
  * 

GOALS:
high availability - end2end connectivity despite network disruyptions
path control (ISP, sender, receiver, jointly control end-to-end paths)
path transparency (path transparency: sender should be aware of packets path)
trust transparency: known roots of trust that need to be relied upon
resliience: to compormised trust roots (limited global scope of certification authorities)

--------
DATA PLANE:


--------


--------
