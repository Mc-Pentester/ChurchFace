# CHURCHFACE CALL SYSTEM - FORENSIC AUDIT REPORT

**Date:** January 2026  
**Audit Type:** Comprehensive Autonomous Forensic Audit  
**Scope:** Complete call system architecture, signaling, media flow, state management, security, and scalability  
**Methodology:** Code-only analysis without modifications, assumptions, or runtime testing

---

# EXECUTIVE SUMMARY

The ChurchFace call system is a **WebRTC P2P implementation with Socket.IO signaling**. Contrary to initial assumptions, LiveKit is **NOT used for 1-1 calls** - it is exclusively used for studio live, prayer rooms, and training rooms. The call system uses native WebRTC with Socket.IO for signaling.

**Critical Finding:** The Socket.IO signaling handlers (`call:offer`, `call:answer`, `call:ice`, `call:end`) **ARE implemented** in `server.ts` (lines 1038-1208), contrary to previous audit reports that claimed they were missing. The system should be functional for basic 1-1 calls.

**Architecture Status:** 
- ✅ Signaling infrastructure exists and is implemented
- ✅ WebRTC peer connection setup is correct
- ✅ ICE candidate handling with queuing
- ✅ Session token-based stale cleanup
- ⚠️ Limited error handling and recovery
- ⚠️ No disconnect handling for active calls
- ⚠️ No reconnection logic
- ⚠️ No multi-tab coordination
- ⚠️ No authentication on signaling events
- ⚠️ No integration with database API routes

---

# 1. ARCHITECTURE OVERVIEW

## 1.1 Technology Stack

**Signaling Layer:**
- Socket.IO (client and server)
- Event-based real-time messaging
- Room-based routing (`user:{userId}`)

**Media Layer:**
- Native WebRTC (RTCPeerConnection)
- STUN servers: `stun.l.google.com:19302`, `stun1.l.google.com:19302`
- No TURN servers configured

**State Management:**
- React Context (CallContext.tsx) for global call state
- Component state (CallModal.tsx) for active call UI
- React refs for concurrency control and session tokens

**Data Persistence:**
- Prisma ORM with PostgreSQL
- Models: `Call`, `CallParticipant`
- API routes: `POST /api/calls`, `PATCH /api/calls/[id]`

**NOT Used for Calls:**
- ❌ LiveKit (used only for studio live, prayer rooms, training)
- ❌ WebRTC SFU/MCU
- ❌ TURN servers

## 1.2 File Inventory

### Frontend Call System
- `contexts/CallContext.tsx` - Global call context, incoming call listener, startCall function
- `components/messaging/CallModal.tsx` - Active call UI, WebRTC logic, signaling handlers
- `components/messaging/IncomingCallModal.tsx` - Incoming call UI, ringing, accept/reject
- `lib/types/webrtc.ts` - TypeScript types for call signaling payloads
- `lib/socket.ts` - Socket.IO client wrapper, presence registration

### Backend Call System
- `server.ts` - Main server with Socket.IO call signaling handlers (lines 1038-1208)
- `server/socket.ts` - Legacy socket server (NOT used for calls)
- `app/api/calls/route.ts` - POST endpoint for call creation
- `app/api/calls/[id]/route.ts` - PATCH endpoint for call status updates

### Database
- `prisma/schema.prisma` - Call and CallParticipant models
- `prisma/migrations/20260827105539_add_call_tables/migration.sql` - Call tables migration

### Related Systems (Not Direct Call System)
- `lib/livekit/LiveKitService.ts` - LiveKit client (studio live, prayers, training)
- `lib/radio/webrtc.ts` - Radio broadcasting WebRTC
- `hooks/useRadioBroadcast.ts` - Radio broadcaster hook
- `hooks/useRadioListener.ts` - Radio listener hook

---

# 2. ACTOR MAPPING

## 2.1 Participants

**Caller (Outgoing Call):**
- Initiates call via `CallContext.startCall()`
- Generates WebRTC offer
- Emits `call:offer` via Socket.IO
- Listens for `call:answer` and `call:ice`
- Manages RTCPeerConnection lifecycle

**Recipient (Incoming Call):**
- Listens for `call:incoming` via `CallContext`
- Displays `IncomingCallModal` with ringing
- Accepts or rejects call
- On accept: generates WebRTC answer
- Emits `call:answer` via Socket.IO
- Listens for `call:ice` and `call:end`

**Server (Signaling Relay):**
- Receives `call:offer` from caller
- Validates payload
- Routes to recipient via `user:{recipientId}` room
- Queues signals if recipient offline (60s expiry)
- Relays `call:answer`, `call:ice`, `call:end` between peers
- Maintains online users registry

## 2.2 Roles and Responsibilities

| Actor | Responsibilities | Key Functions |
|-------|------------------|---------------|
| Caller | Initiate call, create offer, manage PC | `startCall()`, `startOutgoingCall()` |
| Recipient | Receive call, accept/reject, create answer | `handleIncomingCall()`, `acceptIncomingCall()` |
| Server | Relay signaling, validate payloads, queue offline signals | `call:offer` handler, `getRecipientSockets()` |
| Database | Persist call records, status updates | `POST /api/calls`, `PATCH /api/calls/[id]` |

---

# 3. OUTGOING CALL FLOW

## 3.1 Complete Flow Trace

```
1. USER CLICKS "CALL" BUTTON
   ↓
2. ChatWindow.startCall() calls CallContext.startCall()
   ↓
3. CallContext.startCall() generates callId: `${currentUserId}-${recipientId}-${Date.now()}`
   ↓
4. CallContext sets activeCall state and ref atomically
   ↓
5. CallModal component renders with isOpen=true
   ↓
6. CallModal useEffect triggers initialization
   ↓
7. Session token generated: crypto.randomUUID()
   ↓
8. startOutgoingCall(sessionToken) called
   ↓
9. navigator.mediaDevices.getUserMedia({ audio: true, video: callType === "video" })
   ↓
10. RTCPeerConnection created with STUN servers
   ↓
11. Local stream tracks added to PC
   ↓
12. Socket listeners registered: call:answer, call:ice, call:end
   ↓
13. pc.createOffer() → SDP offer
   ↓
14. pc.setLocalDescription(offer)
   ↓
15. socket.emit("call:offer", { callId, offer, recipientId })
   ↓
16. SERVER: call:offer handler (server.ts:1038)
   ↓
17. Server validates callId, recipientId, offer
   ↓
18. Server calls getRecipientSockets(recipientId)
   ↓
19. Server checks onlineUsers registry
   ↓
20. IF recipient online:
    - io.to(targetSocketId).emit("call:incoming", { callId, offer, callerId, callerName, callerImage, callType })
  ELSE:
    - addPendingSignal("offer", ...) with 60s expiry
    - Log warning: RECIPIENT_NOT_REGISTERED
   ↓
21. RECIPIENT: CallContext receives call:incoming
   ↓
22. CallContext sets incomingCall state, shows IncomingCallModal
   ↓
23. IncomingCallModal plays ringing sound
   ↓
24. USER ACCEPTS CALL
   ↓
25. IncomingCallModal calls onAccept()
   ↓
26. CallContext sets activeCall with isIncoming=true
   ↓
27. CallModal renders in incoming mode
   ↓
28. CallModal calls acceptIncomingCall(sessionToken)
   ↓
29. getUserMedia() for recipient's media
   ↓
30. RTCPeerConnection created
   ↓
31. pc.setRemoteDescription(offer) from incoming call data
   ↓
32. pc.createAnswer() → SDP answer
   ↓
33. pc.setLocalDescription(answer)
   ↓
34. socket.emit("call:answer", { callId, answer, recipientId: callerId })
   ↓
35. SERVER: call:answer handler (server.ts:1108)
   ↓
36. Server relays to caller: io.to(callerSocketId).emit("call:answer", { callId, answer })
   ↓
37. CALLER: CallModal receives call:answer
   ↓
38. pc.setRemoteDescription(answer)
   ↓
39. Process queued ICE candidates
   ↓
40. ICE candidates exchanged via call:ice events
   ↓
41. WebRTC connection established (connected state)
   ↓
42. Media streams flowing between peers
   ↓
43. Call duration timer starts
```

## 3.2 Key Decision Points

**Call ID Generation:**
- Location: `CallContext.tsx:168`
- Method: `${currentUserId}-${recipientId}-${Date.now()}`
- Issue: Client-side only, not synchronized with database
- Risk: Call ID mismatch if both parties generate independently

**Session Token:**
- Location: `CallModal.tsx:261`
- Method: `crypto.randomUUID()`
- Purpose: Prevent stale cleanup from previous sessions
- Validation: Checked before every async operation

**ICE Candidate Queuing:**
- Location: `CallModal.tsx:596-600`
- Logic: Queue if `!pc.remoteDescription`, process after setRemoteDescription
- Purpose: Handle ICE candidates arriving before answer

---

# 4. INCOMING CALL FLOW

## 4.1 Complete Flow Trace

```
1. CALLER EMITS call:offer (see Outgoing Flow steps 1-15)
   ↓
2. SERVER relays to recipient via call:incoming
   ↓
3. RECIPIENT: CallContext socket.on("call:incoming") (line 102)
   ↓
4. handleIncomingCall(data) executes
   ↓
5. Check if activeCallRef.current exists (reject if already in call)
   ↓
6. setIncomingCall(data)
   ↓
7. setShowIncoming(true)
   ↓
8. Emit notification: socket.emit("notification:new", ...)
   ↓
9. IncomingCallModal renders
   ↓
10. IncomingCallModal useEffect initializes
   ↓
11. callIdRef.current = serverCallId (from payload)
   ↓
12. playRinging() - loops call.mp3
   ↓
13. socket.on("call:end") registered for early termination
   ↓
14. USER ACTION: ACCEPT or REJECT
   ↓
15A. IF REJECT:
    - socket.emit("call:end", { callId, recipientId: callerId })
    - stopRinging()
    - onClose()
    - CallContext clears incomingCall state
   ↓
15B. IF ACCEPT:
    - stopRinging()
    - onAccept() called
    - CallContext sets activeCall with isIncoming=true
    - IncomingCallModal unmounts
    - CallModal mounts in incoming mode
    ↓
16. CallModal acceptIncomingCall(sessionToken)
    ↓
17. getUserMedia() for recipient's media
    ↓
18. RTCPeerConnection created with STUN servers
    ↓
19. pc.setRemoteDescription(offer) from incomingCallData
    ↓
20. Process any queued ICE candidates
    ↓
21. pc.createAnswer() → SDP answer
    ↓
22. pc.setLocalDescription(answer)
    ↓
23. socket.emit("call:answer", { callId, answer, recipientId: callerId })
    ↓
24. Server relays to caller
    ↓
25. Connection established (see Outgoing Flow steps 36-43)
```

## 4.2 Ringing Behavior

**Sound File:** `/sounds/call.mp3`  
**Loop:** Enabled (`audioRef.current.loop = true`)  
**Stop Conditions:**
- User accepts call
- User rejects call
- Caller ends call (call:end received)
- Modal closes (isOpen becomes false)

---

# 5. SIGNALING ANALYSIS

## 5.1 Socket.IO Events

### Client → Server

| Event | Emitted By | Payload | Handler Location |
|-------|-----------|---------|------------------|
| `call:offer` | CallModal.tsx:514 | `{ callId, offer, recipientId }` | server.ts:1038 |
| `call:answer` | CallModal.tsx:775 | `{ callId, answer, recipientId }` | server.ts:1108 |
| `call:ice` | CallModal.tsx:427, 703 | `{ callId, candidate, recipientId }` | server.ts:1146 |
| `call:end` | CallModal.tsx:839, IncomingCallModal.tsx:113 | `{ callId, recipientId }` | server.ts:1177 |

### Server → Client

| Event | Emitted To | Payload | Listener Location |
|-------|-----------|---------|------------------|
| `call:incoming` | Recipient | `{ callId, offer, callerId, callerName, callerImage, callType }` | CallContext.tsx:102 |
| `call:answer` | Caller | `{ callId, answer }` | CallModal.tsx:451 |
| `call:ice` | Peer | `{ callId, candidate }` | CallModal.tsx:458, 804 |
| `call:end` | Peer | `{ callId }` | CallModal.tsx:465, 811, IncomingCallModal.tsx:85 |

## 5.2 Server Handler Details

### call:offer Handler (server.ts:1038-1106)

**Validation:**
- callId: string, length ≤ 256
- recipientId: string
- offer: object

**Logic:**
1. Log offer received with socketId and userId
2. Call `getRecipientSockets(recipientId)` to find online sockets
3. If recipient online:
   - For each socket: emit `call:incoming` with full payload
   - Log target socketId
4. If recipient offline:
   - Call `addPendingSignal("offer", ...)` with 60s expiry
   - Log warning: RECIPIENT_NOT_REGISTERED

**Payload Transformation:**
- Uses `socket.data.userId` as callerId if available
- Defaults to payload callerId
- Defaults callerName to "Inconnu" if missing

### call:answer Handler (server.ts:1108-1144)

**Validation:**
- callId: string
- recipientId: string
- answer: object

**Logic:**
1. Log answer received
2. Call `getRecipientSockets(recipientId)`
3. If recipient online:
   - For each socket: emit `call:answer` with `{ callId, answer }`
4. If recipient offline:
   - Log warning: RECIPIENT_NOT_REGISTERED
   - No queuing for answers (assumes caller must be online)

### call:ice Handler (server.ts:1146-1175)

**Validation:**
- callId: string
- recipientId: string
- candidate: object

**Logic:**
1. Call `getRecipientSockets(recipientId)`
2. If recipient online:
   - For each socket: emit `call:ice` with `{ callId, candidate }`
3. If recipient offline:
   - Log warning: RECIPIENT_NOT_REGISTERED
   - No queuing for ICE candidates

### call:end Handler (server.ts:1177-1208)

**Validation:**
- callId: string
- recipientId: string

**Logic:**
1. Log end received
2. Call `getRecipientSockets(recipientId)`
3. If recipient online:
   - For each socket: emit `call:end` with `{ callId }`
4. If recipient offline:
   - Log warning: RECIPIENT_NOT_REGISTERED

## 5.3 Pending Signal Queue

**Location:** server.ts:96-209

**Data Structure:**
```typescript
interface PendingSignal {
  signalType: "offer" | "answer" | "ice" | "end";
  callId: string;
  senderUserId: string;
  recipientUserId: string;
  payload: any;
  createdAt: number;
  expiresAt: number;
}
```

**Expiry:** 60 seconds (SIGNAL_EXPIRY_MS)

**Queue Conditions:**
- Only `call:offer` is queued (answers/ICE/end require recipient online)
- Queued when recipient not in onlineUsers registry
- Delivered when recipient registers via `register` event

**Cleanup:**
- Expired signals removed on `addPendingSignal()`
- All signals removed after delivery in `deliverPendingSignals()`

---

# 6. STATE MACHINE

## 6.1 Call States (Client-Side)

**CallContext States:**
- `idle` - No active or incoming call
- `incoming` - Incoming call received, awaiting user action
- `active` - Call in progress (connected or ringing)

**CallModal States:**
- `initializing` - Session token generated, media acquisition starting
- `ringing` - Offer sent, awaiting answer (outgoing) or ringing sound (incoming)
- `connected` - WebRTC connection established, media flowing
- `ended` - Call terminated, cleanup in progress

**WebRTC States:**
- `signalingState`: stable, have-local-offer, have-remote-offer, have-local-pranswer, have-remote-pranswer, closed
- `iceConnectionState`: new, checking, connected, completed, failed, disconnected, closed
- `connectionState`: new, connecting, connected, disconnected, failed, closed

## 6.2 State Transitions

### Outgoing Call

```
idle → initializing
  (startCall called, CallModal opens)

initializing → ringing
  (offer created and sent)

ringing → connected
  (answer received and setRemoteDescription)

connected → ended
  (call:end received or user hangs up)

ended → idle
  (cleanup complete, CallModal closes)
```

### Incoming Call

```
idle → incoming
  (call:incoming received)

incoming → initializing
  (user accepts, CallModal opens)

initializing → connected
  (answer created and sent)

connected → ended
  (call:end received or user hangs up)

ended → idle
  (cleanup complete)
```

### Error Transitions

```
any state → ended
  (error in getUserMedia, WebRTC, or signaling)

any state → idle
  (stale session detected via sessionToken mismatch)
```

## 6.3 Concurrency Protections

**Double Call Prevention:**
- `startingCallRef.current` - Blocks concurrent startCall calls
- `activeCallRef.current` - Atomic check before allowing new call
- `initializationInProgressRef.current` - Blocks double initialization

**Stale Session Prevention:**
- `sessionTokenRef.current` - UUID generated per session
- Checked before every async operation
- Cleanup validates token before executing

**Double Offer/Answer Prevention:**
- `offerCreatedCallIdRef.current` - Tracks which callId had offer created
- `initializedCallIdRef.current` - Tracks which callId was initialized
- Blocks duplicate createOffer/createAnswer for same callId

---

# 7. WEBRTC/MEDIA AUDIT

## 7.1 Peer Connection Configuration

**ICE Servers:**
```typescript
{
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" }
  ]
}
```

**Assessment:**
- ✅ STUN servers configured for NAT traversal
- ❌ No TURN servers (will fail in symmetric NAT)
- ❌ No ICE transport policy (relies on browser default)

## 7.2 Media Acquisition

**Constraints:**
```typescript
{
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  },
  video: callType === "video"
}
```

**Assessment:**
- ✅ Audio processing enabled
- ✅ Conditional video based on call type
- ✅ No specific video constraints (resolution, framerate)

## 7.3 Track Management

**Local Tracks:**
- Added to PC via `pc.addTrack(track, stream)`
- Stopped in cleanup via `track.stop()`
- Muted via `track.enabled = false`

**Remote Tracks:**
- Received via `pc.ontrack` event
- Attached to `<video>` element via `srcObject = event.streams[0]`
- No explicit track muting (only local tracks)

## 7.4 ICE Candidate Handling

**Emission:**
```typescript
pc.onicecandidate = (event) => {
  if (event.candidate) {
    socket.emit("call:ice", { callId, candidate: event.candidate, recipientId });
  }
};
```

**Reception:**
```typescript
const handleIce = async ({ candidate, callId }) => {
  if (!pc.remoteDescription) {
    pendingIceCandidatesRef.current.push(candidate);
    return;
  }
  await pc.addIceCandidate(candidate);
};
```

**Assessment:**
- ✅ Queuing for early candidates
- ✅ Processing after remoteDescription set
- ✅ Error handling for addIceCandidate failures

## 7.5 Connection Monitoring

**Logged States:**
- `iceConnectionState` - ICE connection status
- `connectionState` - Overall connection status
- `signalingState` - SDP negotiation status
- `iceGatheringState` - ICE gathering status

**Assessment:**
- ✅ Comprehensive logging
- ❌ No automatic recovery actions
- ❌ No user feedback on connection issues

---

# 8. SESSION MANAGEMENT

## 8.1 Call ID Lifecycle

**Generation:**
- Location: `CallContext.tsx:168`
- Method: `${currentUserId}-${recipientId}-${Date.now()}`
- Timing: When `startCall()` is invoked

**Propagation:**
- Passed to CallModal via prop
- Stored in `callIdRef.current`
- Included in all signaling payloads
- Used for event filtering (ignore foreign events)

**Issues:**
- ❌ Not synchronized with database API
- ❌ No validation that recipient uses same callId
- ❌ Potential for mismatch if both parties generate independently

## 8.2 Session Token Lifecycle

**Generation:**
- Location: `CallModal.tsx:261`
- Method: `crypto.randomUUID()`
- Timing: When CallModal initializes

**Usage:**
- Stored in `sessionTokenRef.current`
- Validated before async operations
- Passed to cleanup function
- Prevents stale cleanup from previous sessions

**Cleanup:**
- Cleared in cleanup function (last step)
- Checked against before executing operations
- Prevents race conditions from rapid open/close

## 8.3 Cleanup Process

**Triggered By:**
- User hangs up (handleEndCall)
- Remote party ends call (call:end received)
- Component unmounts (useEffect cleanup)
- Modal closes (isOpen becomes false)
- Error during initialization

**Cleanup Steps:**
1. Remove Socket.IO listeners (call:answer, call:ice, call:end)
2. Close RTCPeerConnection (if not closed)
3. Stop local stream tracks
4. Clear video sources (local and remote)
5. Stop ringing sound
6. Clear ICE candidate queue
7. Clear duration interval
8. Reset React state (duration, connected, ringing)
9. Clear refs (callId, sessionToken, initialization flags)

**Idempotency:**
- Checks `pc.signalingState !== "closed"` before closing
- Checks sessionToken before cleanup
- Safe to call multiple times

---

# 9. RACE CONDITIONS

## 9.1 Identified Race Conditions

### Double Call Initiation

**Scenario:** User clicks call button twice rapidly

**Protection:**
- `startingCallRef.current` blocks concurrent starts
- `activeCallRef.current` atomic check
- Both refs checked before allowing new call

**Assessment:** ✅ Adequately protected

### Stale Session Events

**Scenario:** Call ends, new call starts, old call's events arrive

**Protection:**
- Session token validation in all handlers
- Event filtering by callId
- Stale cleanup ignored if token mismatch

**Assessment:** ✅ Adequately protected

### Rapid Open/Close

**Scenario:** User opens and closes call modal rapidly

**Protection:**
- `initializationInProgressRef.current` blocks double init
- Session token prevents stale operations
- Cleanup validates token before executing

**Assessment:** ✅ Adequately protected

### ICE Before Answer

**Scenario:** ICE candidates arrive before remoteDescription set

**Protection:**
- ICE candidate queuing in `pendingIceCandidatesRef.current`
- Processed after `setRemoteDescription(answer)`
- Early candidates preserved

**Assessment:** ✅ Adequately protected

### Multi-Tab Calls

**Scenario:** User has app open in multiple tabs, starts call in both

**Protection:**
- ❌ NO multi-tab coordination
- Each tab has independent CallContext
- Both tabs could initiate calls simultaneously
- Socket.IO presence registers both sockets

**Assessment:** ❌ NOT PROTECTED - potential for duplicate calls

### Socket Reconnection During Call

**Scenario:** Socket disconnects and reconnects during active call

**Protection:**
- ❌ NO reconnection handling
- Socket listeners not re-registered after reconnect
- Call state not synchronized after reconnect
- WebRTC connection may survive but signaling broken

**Assessment:** ❌ NOT PROTECTED - call will likely fail

## 9.2 Concurrency Issues Summary

| Issue | Protected | Severity |
|-------|-----------|----------|
| Double call initiation | ✅ Yes | Low |
| Stale session events | ✅ Yes | Low |
| Rapid open/close | ✅ Yes | Low |
| ICE before answer | ✅ Yes | Low |
| Multi-tab calls | ❌ No | Medium |
| Socket reconnection | ❌ No | High |
| Network interruption | ❌ No | High |

---

# 10. NETWORK ANALYSIS

## 10.1 Reconnection Logic

**Current State:** None

**Socket.IO Client Configuration:**
```typescript
// lib/socket.ts
const socket = io({
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});
```

**Assessment:**
- ✅ Socket.IO has built-in reconnection
- ❌ Call-specific reconnection logic missing
- ❌ WebRTC connection not restored after socket reconnect
- ❌ Signaling state not synchronized

## 10.2 Multi-Tab Behavior

**Current State:** No coordination

**Presence Registration:**
- Each tab registers independently via `useSocketPresence()`
- Each tab joins `user:{userId}` room
- Both tabs receive `call:incoming` events

**Call Initiation:**
- Each tab has independent CallContext
- Both tabs can initiate calls
- No cross-tab communication

**Assessment:**
- ❌ No multi-tab call coordination
- ❌ Potential for duplicate incoming call modals
- ❌ No mechanism to prevent concurrent calls across tabs

## 10.3 Mobile Considerations

**Current State:** No mobile-specific handling

**Browser Compatibility:**
- Uses standard WebRTC API
- Uses standard getUserMedia API
- Should work on modern mobile browsers

**Issues:**
- ❌ No handling for mobile-specific constraints (battery, network)
- ❌ No handling for app backgrounding
- ❌ No handling for mobile OS interruptions (phone calls)
- ❌ No handling for mobile network switches (WiFi → cellular)

## 10.4 Network Interruption Handling

**Current State:** None

**Scenarios Not Handled:**
- WiFi → Cellular switch
- Temporary network loss
- High latency / packet loss
- Bandwidth constraints

**Assessment:**
- ❌ No network quality monitoring
- ❌ No adaptive bitrate
- ❌ No fallback mechanisms
- ❌ No user feedback on network issues

---

# 11. SECURITY AUDIT

## 11.1 Authentication

**Socket.IO Authentication:**
- ❌ NO authentication on socket connection
- ❌ NO authentication on signaling events
- ❌ NO verification that socket.data.userId matches payload userId

**API Route Authentication:**
- ✅ Uses NextAuth session
- ✅ Validates user before creating/updating calls
- ✅ Verifies user is caller or recipient

**Assessment:**
- ⚠️ Signaling layer unauthenticated
- ⚠️ Vulnerable to unauthorized call signaling
- ⚠️ Could be exploited for call spam or harassment

## 11.2 Authorization

**Call Participation:**
- ❌ NO verification that recipient is authorized to receive call
- ❌ NO verification that caller is authorized to initiate call
- ❌ NO blocklist/ignore list integration

**Assessment:**
- ❌ Any user can call any other user
- ❌ No privacy controls
- ❌ No blocking mechanism

## 11.3 Input Validation

**Server-Side Validation:**
- ✅ callId: string, length ≤ 256
- ✅ recipientId: string
- ✅ offer: object
- ✅ answer: object
- ✅ candidate: object

**Client-Side Validation:**
- ⚠️ Minimal validation before emitting events
- ⚠️ Relies on server for validation

**Assessment:**
- ✅ Basic type validation present
- ❌ No semantic validation (e.g., valid SDP)
- ❌ No rate limiting
- ❌ No payload size limits

## 11.4 Signaling Security

**Encryption:**
- ✅ Socket.IO uses TLS (if server uses HTTPS/WSS)
- ❌ No end-to-end encryption for signaling payloads
- ❌ Offer/answer SDP visible to server

**Privacy:**
- ❌ Server can inspect all signaling
- ❌ Server could modify signaling (MITM)
- ❌ No forward secrecy

**Assessment:**
- ⚠️ Trust model requires trusted server
- ❌ Not suitable for end-to-end encrypted calls
- ❌ SDP contains IP addresses (privacy concern)

## 11.5 Rate Limiting

**Current State:** None

**Potential Attacks:**
- Call spam (rapid call:offer emissions)
- ICE candidate flood
- Signal amplification (relay through server)

**Assessment:**
- ❌ No rate limiting on signaling events
- ❌ No per-user rate limits
- ❌ No global rate limits
- ⚠️ Vulnerable to DoS via signaling flood

---

# 12. SERVER ANALYSIS

## 12.1 Scalability

**Current Architecture:**
- Single Socket.IO server instance
- In-memory onlineUsers registry (Map)
- In-memory pendingSignals queue (Map)

**Scalability Issues:**
- ❌ OnlineUsers not shared across instances
- ❌ PendingSignals not shared across instances
- ❌ No horizontal scaling support
- ❌ Single point of failure

**Assessment:**
- ❌ Not suitable for multi-instance deployment
- ❌ Requires sticky sessions if scaled
- ❌ Redis or similar needed for shared state

## 12.2 Multi-Instance Support

**Current State:** Not supported

**Requirements for Multi-Instance:**
- Redis adapter for Socket.IO
- Shared onlineUsers registry (Redis)
- Shared pendingSignals queue (Redis)
- Consistent routing across instances

**Assessment:**
- ❌ No Redis adapter configured
- ❌ No shared state mechanism
- ❌ Would require significant refactoring

## 12.3 Resource Management

**Memory:**
- onlineUsers: Map<string, Set<string>> - grows with active users
- pendingSignals: Map<string, PendingSignal[]> - grows with offline users
- radioParticipants: Map<string, Map<string, RadioParticipant>> - grows with radio sessions

**Cleanup:**
- ✅ onlineUsers cleaned on disconnect
- ✅ pendingSignals cleaned on expiry (60s)
- ✅ pendingSignals cleaned on delivery
- ✅ radioParticipants cleaned on leave

**Assessment:**
- ✅ Adequate cleanup mechanisms
- ⚠️ No periodic cleanup for stale entries
- ⚠️ No memory limits or monitoring

## 12.4 Error Handling

**Server-Side:**
- ✅ Try-catch blocks in handlers
- ✅ Console error logging
- ❌ No error propagation to clients
- ❌ No error recovery mechanisms
- ❌ No circuit breakers

**Assessment:**
- ⚠️ Basic error handling present
- ❌ No structured error responses
- ❌ No client error feedback

---

# 13. DATABASE INTEGRATION

## 13.1 API Routes

### POST /api/calls

**Purpose:** Create call record in database

**Implementation:**
```typescript
// Creates Call with status "incoming"
// Creates CALL_INCOMING notification for recipient
// Returns callId
```

**Usage in Call System:**
- ❌ NOT called by CallContext or CallModal
- ❌ Call system bypasses database entirely
- ❌ No persistence of call records

**Assessment:**
- ❌ API route exists but unused
- ❌ No call history tracking
- ❌ No audit trail

### PATCH /api/calls/[id]

**Purpose:** Update call status

**Supported Statuses:**
- incoming
- ringing
- connected
- ended
- missed

**Usage in Call System:**
- ❌ NOT called by CallContext or CallModal
- ❌ Call status never updated in database

**Assessment:**
- ❌ API route exists but unused
- ❌ No call lifecycle tracking
- ❌ No missed call detection

## 13.2 Database Schema

**Call Model:**
```prisma
model Call {
  id          String   @id @default(cuid())
  callerId    String
  recipientId String
  callType    String
  status      String
  startedAt   DateTime @default(now())
  endedAt     DateTime?
  caller      User     @relation("CallCaller", ...)
  recipient   User     @relation("CallRecipient", ...)
  participants CallParticipant[]
}
```

**CallParticipant Model:**
```prisma
model CallParticipant {
  id        String   @id @default(cuid())
  callId    String
  userId    String
  joinedAt  DateTime @default(now())
  leftAt    DateTime?
  call      Call     @relation(...)
  user      User     @relation(...)
}
```

**Assessment:**
- ✅ Schema supports call tracking
- ❌ Not utilized by call system
- ❌ No foreign key constraints enforced by code

## 13.3 Notification Integration

**Notification Creation:**
- ✅ API route creates CALL_INCOMING notification
- ✅ Notification emitted via Socket.IO
- ❌ Call system does not use notification system

**Assessment:**
- ⚠️ Duplicate notification paths (API vs direct socket)
- ❌ Inconsistent notification behavior

---

# 14. DEFECT CLASSIFICATION

## 14.1 Critical Defects

### 1. No Disconnect Handling for Active Calls

**Severity:** CRITICAL  
**Impact:** If user disconnects during call, other party not notified  
**Location:** server.ts (missing disconnect handler for calls)  
**Recommendation:** Add disconnect handler that identifies active calls and notifies peers

### 2. No Reconnection Logic

**Severity:** CRITICAL  
**Impact:** Socket reconnection breaks call signaling  
**Location:** CallModal.tsx (no reconnection handlers)  
**Recommendation:** Implement reconnection handlers that re-establish signaling state

### 3. No Authentication on Signaling

**Severity:** CRITICAL  
**Impact:** Unauthorized users can send signaling events  
**Location:** server.ts call handlers (no auth check)  
**Recommendation:** Add authentication verification to all signaling handlers

### 4. No Multi-Instance Support

**Severity:** CRITICAL  
**Impact:** Cannot scale horizontally  
**Location:** server.ts (in-memory state)  
**Recommendation:** Implement Redis adapter for Socket.IO and shared state

## 14.2 High Severity Defects

### 5. No Database Integration

**Severity:** HIGH  
**Impact:** No call history, no audit trail  
**Location:** CallContext.tsx, CallModal.tsx (no API calls)  
**Recommendation:** Integrate with POST /api/calls and PATCH /api/calls/[id]

### 6. No Rate Limiting

**Severity:** HIGH  
**Impact:** Vulnerable to DoS via signaling flood  
**Location:** server.ts (no rate limiting)  
**Recommendation:** Implement rate limiting on signaling events

### 7. No Authorization Checks

**Severity:** HIGH  
**Impact:** Any user can call any other user  
**Location:** server.ts (no authorization)  
**Recommendation:** Implement authorization checks and blocking mechanism

### 8. No Multi-Tab Coordination

**Severity:** HIGH  
**Impact:** Duplicate calls across tabs  
**Location:** CallContext.tsx (no cross-tab communication)  
**Recommendation:** Implement cross-tab coordination via BroadcastChannel or localStorage

## 14.3 Medium Severity Defects

### 9. No TURN Servers

**Severity:** MEDIUM  
**Impact:** Calls fail in symmetric NAT environments  
**Location:** CallModal.tsx (ICE config)  
**Recommendation:** Add TURN server configuration

### 10. No Network Quality Monitoring

**Severity:** MEDIUM  
**Impact:** Poor user experience on bad networks  
**Location:** CallModal.tsx (no monitoring)  
**Recommendation:** Implement WebRTC stats collection and user feedback

### 11. No Mobile-Specific Handling

**Severity:** MEDIUM  
**Impact:** Poor mobile experience  
**Location:** CallModal.tsx (no mobile handling)  
**Recommendation:** Add mobile-specific handling for backgrounding, network switches

### 12. Client-Side Call ID Generation

**Severity:** MEDIUM  
**Impact:** Potential call ID mismatch  
**Location:** CallContext.tsx (client-side generation)  
**Recommendation:** Generate callId via API and use server-generated ID

## 14.4 Low Severity Defects

### 13. No Error Recovery

**Severity:** LOW  
**Impact:** Calls fail on transient errors  
**Location:** CallModal.tsx (no recovery)  
**Recommendation:** Implement retry logic for transient failures

### 14. No User Feedback on Connection Issues

**Severity:** LOW  
**Impact:** Poor UX on connection problems  
**Location:** CallModal.tsx (no feedback)  
**Recommendation:** Add user-facing error messages and connection status

### 15. Limited Logging

**Severity:** LOW  
**Impact:** Difficult to debug issues  
**Location:** server.ts (basic logging)  
**Recommendation:** Implement structured logging with correlation IDs

---

# 15. RECOMMENDATIONS

## 15.1 Immediate Actions (Critical)

1. **Add Disconnect Handler**
   - Implement socket disconnect handler in server.ts
   - Identify active calls for disconnecting user
   - Emit call:end to peer
   - Update call status in database

2. **Add Reconnection Logic**
   - Implement socket reconnect handlers in CallModal
   - Re-establish signaling state after reconnect
   - Re-register event listeners
   - Consider re-creating WebRTC connection if needed

3. **Add Authentication to Signaling**
   - Verify socket.data.userId in all call handlers
   - Validate that callerId matches authenticated user
   - Reject unauthorized signaling attempts

4. **Integrate Database API**
   - Call POST /api/calls before emitting call:offer
   - Use server-generated callId
   - Call PATCH /api/calls/[id] on state changes
   - Track call lifecycle in database

## 15.2 Short-Term Improvements (High Priority)

5. **Add Rate Limiting**
   - Implement per-user rate limiting on signaling events
   - Add global rate limits
   - Implement backoff for repeated failures

6. **Add Authorization**
   - Implement blocklist/ignore list
   - Add privacy controls
   - Verify recipient consent before allowing calls

7. **Add Multi-Tab Coordination**
   - Use BroadcastChannel for cross-tab communication
   - Prevent duplicate calls across tabs
   - Coordinate incoming call display

8. **Add TURN Servers**
   - Configure TURN servers for NAT traversal
   - Fallback to STUN if TURN unavailable
   - Test in various network conditions

## 15.3 Medium-Term Improvements (Medium Priority)

9. **Implement Multi-Instance Support**
   - Add Redis adapter for Socket.IO
   - Move onlineUsers to Redis
   - Move pendingSignals to Redis
   - Test horizontal scaling

10. **Add Network Quality Monitoring**
    - Collect WebRTC stats (RTT, packet loss, bitrate)
    - Display connection quality to user
    - Implement adaptive bitrate if needed

11. **Add Mobile-Specific Handling**
    - Handle app backgrounding
    - Handle network switches
    - Handle OS interruptions
    - Optimize for mobile constraints

12. **Improve Error Handling**
    - Add structured error responses
    - Implement retry logic
    - Add user-facing error messages
    - Implement circuit breakers

## 15.4 Long-Term Improvements (Low Priority)

13. **Add End-to-End Encryption**
    - Implement signaling encryption
    - Consider SFU for media encryption
    - Implement forward secrecy

14. **Add Call Recording**
    - Implement server-side recording
    - Add user consent mechanism
    - Store recordings securely

15. **Add Advanced Features**
    - Call screening
    - Call transfer
    - Call conferencing
    - Screen sharing

---

# 16. TEST PLAN

## 16.1 Unit Tests

**CallContext:**
- Test startCall with valid parameters
- Test startCall with active call (should reject)
- Test incoming call handling
- Test session token validation

**CallModal:**
- Test outgoing call initialization
- Test incoming call acceptance
- Test ICE candidate queuing
- Test cleanup with session token
- Test stale session rejection

**Server Handlers:**
- Test call:offer with valid payload
- Test call:offer with invalid payload
- Test call:offer with offline recipient (queuing)
- Test call:answer routing
- Test call:ice routing
- Test call:end routing

## 16.2 Integration Tests

**Outgoing Call Flow:**
- Test complete flow from startCall to connection
- Test with recipient online
- Test with recipient offline (queuing)
- Test call termination

**Incoming Call Flow:**
- Test complete flow from call:incoming to connection
- Test accept flow
- Test reject flow
- Test caller cancellation

**Error Scenarios:**
- Test getUserMedia denial
- Test WebRTC connection failure
- Test socket disconnection during call
- Test network interruption

## 16.3 E2E Tests

**Happy Path:**
- User A calls User B
- User B accepts
- Call connects
- Media flows
- User A ends call
- Call terminates cleanly

**Error Paths:**
- User B rejects call
- User B offline
- Network failure during call
- User A disconnects during call
- Multi-tab scenario

**Edge Cases:**
- Rapid call start/stop
- Concurrent calls
- ICE candidate timing
- Session token validation

## 16.4 Load Tests

**Signaling Load:**
- Test with 100 concurrent call attempts
- Test with 1000 concurrent call attempts
- Measure latency and failure rate
- Identify bottlenecks

**Memory Load:**
- Test with 1000 online users
- Test with 10000 pending signals
- Monitor memory usage
- Test cleanup efficiency

---

# 17. CONCLUSION

## 17.1 System Status

**Functional Status:** 
- ✅ Basic 1-1 call signaling is implemented
- ✅ WebRTC peer connection setup is correct
- ✅ Socket.IO handlers exist and are functional
- ⚠️ Limited error handling and recovery
- ❌ No disconnect handling
- ❌ No reconnection logic
- ❌ No database integration
- ❌ No authentication on signaling

**Architecture Status:**
- ✅ Clean separation of concerns
- ✅ Session token-based concurrency control
- ✅ ICE candidate queuing
- ❌ No multi-instance support
- ❌ No multi-tab coordination
- ❌ No mobile optimization

**Security Status:**
- ✅ API routes authenticated
- ❌ Signaling unauthenticated
- ❌ No authorization checks
- ❌ No rate limiting
- ⚠️ Server can inspect all signaling

## 17.2 Key Findings

1. **Contrary to previous reports, Socket.IO signaling handlers ARE implemented** in server.ts (lines 1038-1208). The basic signaling infrastructure exists and should be functional.

2. **LiveKit is NOT used for 1-1 calls** - it's exclusively used for studio live, prayer rooms, and training. The call system uses native WebRTC.

3. **The call system does not integrate with the database API routes** - calls are entirely in-memory with no persistence or audit trail.

4. **No disconnect handling** - if a user disconnects during a call, the other party is not notified.

5. **No reconnection logic** - socket reconnection breaks call signaling and there's no recovery mechanism.

6. **No authentication on signaling events** - any connected socket can send signaling events, creating security risks.

7. **No multi-instance support** - the in-memory state (onlineUsers, pendingSignals) prevents horizontal scaling.

8. **No multi-tab coordination** - multiple tabs can independently initiate calls, causing conflicts.

## 17.3 Risk Assessment

**High Risk:**
- Disconnect handling missing (calls don't terminate properly)
- No reconnection logic (calls fail on network issues)
- No authentication (security vulnerability)
- No multi-instance support (scalability constraint)

**Medium Risk:**
- No database integration (no audit trail)
- No rate limiting (DoS vulnerability)
- No authorization (privacy concern)
- No multi-tab coordination (UX issue)

**Low Risk:**
- No TURN servers (NAT traversal limitation)
- No network monitoring (poor UX on bad networks)
- No mobile handling (poor mobile experience)

## 17.4 Compliance with User Requirements

The audit was conducted **without any modifications** to the codebase, as explicitly required. All findings are based solely on code analysis without assumptions or runtime testing.

The audit addresses the following aspects requested:
- ✅ Architecture identification
- ✅ Signaling mechanism analysis
- ✅ Media flow analysis
- ✅ State machine reconstruction
- ✅ Actor mapping
- ✅ Error handling analysis
- ✅ Security audit
- ✅ Scalability assessment
- ✅ Defect classification
- ✅ Recommendations

---

# APPENDICES

## Appendix A: Socket.IO Event Reference

### Client Events (Emitted)
- `call:offer` - WebRTC offer from caller
- `call:answer` - WebRTC answer from recipient
- `call:ice` - ICE candidate from peer
- `call:end` - Call termination signal
- `register` - User registration for presence
- `notification:new` - Notification emission

### Server Events (Emitted)
- `call:incoming` - Incoming call notification to recipient
- `call:answer` - WebRTC answer relayed to caller
- `call:ice` - ICE candidate relayed to peer
- `call:end` - Call termination relayed to peer
- `register:ack` - Registration acknowledgment
- `notification:new` - Notification to user

### Server Events (Received)
- `call:offer` - Handle WebRTC offer
- `call:answer` - Handle WebRTC answer
- `call:ice` - Handle ICE candidate
- `call:end` - Handle call termination
- `register` - Register user for presence
- `user:online` - Mark user as online

## Appendix B: WebRTC State Reference

### RTCPeerConnection States

**signalingState:**
- `stable` - No negotiation in progress
- `have-local-offer` - Local offer set, waiting for answer
- `have-remote-offer` - Remote offer set, waiting for answer
- `have-local-pranswer` - Local provisional answer set
- `have-remote-pranswer` - Remote provisional answer set
- `closed` - Connection closed

**iceConnectionState:**
- `new` - ICE agent created
- `checking` - ICE candidates being checked
- `connected` - ICE connection established
- `completed` - ICE checking complete
- `failed` - ICE connection failed
- `disconnected` - ICE connection lost
- `closed` - ICE agent closed

**connectionState:**
- `new` - Connection created
- `connecting` - Connection in progress
- `connected` - Connection established
- `disconnected` - Connection lost
- `failed` - Connection failed
- `closed` - Connection closed

**iceGatheringState:**
- `new` - ICE agent created
- `gathering` - Gathering candidates
- `complete` - Gathering complete

## Appendix C: Database Schema Reference

### Call Model

```prisma
model Call {
  id          String   @id @default(cuid())
  callerId    String
  recipientId String
  callType    String
  status      String
  startedAt   DateTime @default(now())
  endedAt     DateTime?
  caller      User     @relation("CallCaller", fields: [callerId], references: [id], onDelete: Cascade)
  recipient   User     @relation("CallRecipient", fields: [recipientId], references: [id], onDelete: Cascade)
  participants CallParticipant[]

  @@index([callerId])
  @@index([recipientId])
  @@index([status])
}
```

### CallParticipant Model

```prisma
model CallParticipant {
  id        String   @id @default(cuid())
  callId    String
  userId    String
  joinedAt  DateTime @default(now())
  leftAt    DateTime?
  call      Call     @relation(fields: [callId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([callId, userId])
  @@index([callId])
  @@index([userId])
}
```

---

**END OF AUDIT REPORT**

**Audit Confirmation:** No modifications were made to the codebase during this audit. All findings are based solely on static code analysis.
