# CHURCHFACE CALL SYSTEM
# FORENSIC VALIDATION REPORT

**Date:** January 2026  
**Audit Type:** Comprehensive Forensic Validation  
**Scope:** Complete call system architecture, signaling, media flow, state management, security, and scalability  
**Methodology:** Code-only analysis without modifications, assumptions, or runtime testing  
**Mode:** STRICT - READ ONLY - NO MODIFICATIONS

---

## 1. EXECUTIVE SUMMARY

The ChurchFace call system is a **WebRTC P2P implementation with Socket.IO signaling**. The system has **DUPLICATE Socket.IO server implementations** - one in `server.ts` (active) and one in `server/socket.ts` (legacy/unused). The database models `Call` and `CallParticipant` exist in migration SQL but **ARE NOT defined in schema.prisma**, making them inaccessible to Prisma.

**Critical Finding:** The Socket.IO signaling handlers (`call:offer`, `call:answer`, `call:ice`, `call:end`) **ARE implemented** in `server.ts` (lines 1038-1208). However, there is a **duplicate implementation** in `server/socket.ts` (lines 79-232) that appears to be legacy code.

**Architecture Status:**
- ✅ Signaling infrastructure exists and is implemented (in server.ts)
- ✅ WebRTC peer connection setup is correct
- ✅ ICE candidate handling with queuing
- ✅ Session token-based stale cleanup
- ❌ Database models Call/CallParticipant NOT in schema.prisma
- ❌ API routes exist but cannot access Call models via Prisma
- ❌ No disconnect handling for active calls
- ❌ No reconnection logic
- ❌ No authentication on signaling events
- ❌ No multi-tab coordination
- ❌ No rate limiting on signaling events

**Database Status:**
- Migration SQL exists: `prisma/migrations/20260827105539_add_call_tables/migration.sql`
- Models NOT in `schema.prisma` - grep search returned NO results
- API routes reference `prisma.call` and `prisma.callParticipant` - these will FAIL at runtime
- Database tables may exist from migration but Prisma client cannot access them

---

## 2. SYSTEM ARCHITECTURE

### 2.1 Technology Stack

**Signaling Layer:**
- Socket.IO (client and server)
- Event-based real-time messaging
- Room-based routing (`user:{userId}`)
- **DUPLICATE SERVER IMPLEMENTATIONS:**
  - `server.ts` - Active server with call handlers (lines 1038-1208)
  - `server/socket.ts` - Legacy server with call handlers (lines 79-232)

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
- **Models Call and CallParticipant NOT in schema.prisma**
- Migration SQL exists but models inaccessible
- API routes: `POST /api/calls`, `PATCH /api/calls/[id]` - WILL FAIL at runtime

**NOT Used for Calls:**
- ❌ LiveKit (used only for studio live, prayer rooms, training)
- ❌ WebRTC SFU/MCU
- ❌ TURN servers

### 2.2 Component Flow

**Signaling Flow:**
```
UI (ChatWindow)
 ↓
CallContext.startCall()
 ↓
CallModal (WebRTC + Socket.IO)
 ↓
socket.emit("call:offer")
 ↓
server.ts (active server)
 ↓
io.to(targetSocketId).emit("call:incoming")
 ↓
CallContext (recipient)
 ↓
IncomingCallModal
 ↓
CallModal (accept)
 ↓
socket.emit("call:answer")
 ↓
server.ts
 ↓
WebRTC connection established
```

**Database Flow (BROKEN):**
```
UI
 ↓
CallContext.startCall()
 ↓
NO API CALL
 ↓
NO DATABASE PERSISTENCE
```

**API Routes (EXIST BUT BROKEN):**
```
POST /api/calls
 ↓
prisma.call.create() ← WILL FAIL (model not in schema)
 ↓
createNotification()
 ↓
Returns callId
```

---

## 3. FILE INVENTORY

| Fichier | Rôle | Utilisé réellement ? | Appels dépendants | Risque |
| ------- | ---- | -------------------- | ----------------- | ------ |
| `contexts/CallContext.tsx` | Global call context, incoming call listener, startCall | ✅ OUI | CallModal, IncomingCallModal | LOW |
| `components/messaging/CallModal.tsx` | Active call UI, WebRTC logic, signaling handlers | ✅ OUI | CallContext | LOW |
| `components/messaging/IncomingCallModal.tsx` | Incoming call UI, ringing, accept/reject | ✅ OUI | CallContext | LOW |
| `lib/socket.ts` | Socket.IO client wrapper, presence registration | ✅ OUI | CallContext, CallModal | LOW |
| `lib/types/webrtc.ts` | TypeScript types for call signaling payloads | ✅ OUI | CallModal, IncomingCallModal | LOW |
| `server.ts` | Main server with Socket.IO call signaling handlers | ✅ OUI (ACTIF) | Frontend | MEDIUM |
| `server/socket.ts` | Legacy socket server with duplicate call handlers | ❌ NON (LEGACY) | Aucun | LOW (legacy) |
| `app/api/calls/route.ts` | POST endpoint for call creation | ❌ NON (BROKEN) | Aucun | HIGH (runtime error) |
| `app/api/calls/[id]/route.ts` | PATCH endpoint for call status updates | ❌ NON (BROKEN) | Aucun | HIGH (runtime error) |
| `prisma/schema.prisma` | Database schema | ❌ NON (Call models missing) | API routes | CRITICAL |
| `prisma/migrations/20260827105539_add_call_tables/migration.sql` | Call tables migration | ❌ NON (applied but models missing) | Database | CRITICAL |

### 3.1 File Details

**contexts/CallContext.tsx**
- **Responsibilities:** Global call state management, incoming call listener, startCall function
- **Imports:** React hooks, next-auth session, socket, IncomingCallModal, CallModal
- **Dependencies:** lib/socket.ts
- **Called by:** App root provider
- **Events emitted:** notification:new
- **Events listened:** call:incoming
- **Status:** ACTIVE

**components/messaging/CallModal.tsx**
- **Responsibilities:** WebRTC peer connection management, signaling handlers, UI
- **Imports:** React hooks, lucide-react icons, socket
- **Dependencies:** lib/socket.ts
- **Called by:** CallContext
- **Events emitted:** call:offer, call:answer, call:ice, call:end
- **Events listened:** call:answer, call:ice, call:end
- **Status:** ACTIVE

**components/messaging/IncomingCallModal.tsx**
- **Responsibilities:** Incoming call UI, ringing, accept/reject
- **Imports:** React hooks, lucide-react icons, socket
- **Dependencies:** lib/socket.ts
- **Called by:** CallContext
- **Events emitted:** call:end (on reject)
- **Events listened:** call:end
- **Status:** ACTIVE

**lib/socket.ts**
- **Responsibilities:** Socket.IO client singleton, presence registration
- **Imports:** socket.io-client, next-auth session
- **Dependencies:** None
- **Called by:** CallContext, CallModal, IncomingCallModal
- **Events emitted:** register
- **Events listened:** connect, disconnect, register:ack
- **Status:** ACTIVE

**server.ts** (LINES 1038-1208)
- **Responsibilities:** Socket.IO server, call signaling handlers, online users registry, pending signals queue
- **Imports:** http, next, socket.io, prisma, notifications
- **Dependencies:** lib/prisma, lib/notifications
- **Called by:** Next.js server
- **Events emitted:** call:incoming, call:answer, call:ice, call:end, register:ack
- **Events listened:** register, call:offer, call:answer, call:ice, call:end
- **Status:** ACTIVE

**server/socket.ts** (LINES 79-232)
- **Responsibilities:** Legacy Socket.IO server with duplicate call handlers
- **Imports:** socket.io
- **Dependencies:** None
- **Called by:** Unknown (appears unused)
- **Events emitted:** call:incoming, call:answer, call:ice, call:end
- **Events listened:** call:offer, call:answer, call:ice, call:end
- **Status:** LEGACY / DUPLICATE

**app/api/calls/route.ts**
- **Responsibilities:** POST endpoint for call creation
- **Imports:** next-auth, prisma, notifications
- **Dependencies:** lib/prisma, lib/notifications
- **Called by:** None (not called by frontend)
- **Status:** BROKEN (prisma.call not in schema)

**app/api/calls/[id]/route.ts**
- **Responsibilities:** PATCH endpoint for call status updates
- **Imports:** next-auth, prisma, notifications
- **Dependencies:** lib/prisma, lib/notifications
- **Called by:** None (not called by frontend)
- **Status:** BROKEN (prisma.call not in schema)

---

## 4. CALL LIFECYCLE

### 4.1 Call ID Generation

**Location:** `contexts/CallContext.tsx:168`

**Method:**
```typescript
const callId = `${currentUserId}-${recipientId}-${Date.now()}`;
```

**Analysis:**
- ✅ Client-side generation
- ✅ Unique per call (timestamp)
- ❌ NOT synchronized with database
- ❌ NOT server-generated
- ❌ No validation that recipient uses same callId
- ❌ Potential for mismatch if both parties generate independently

**Evidence:**
- File: `contexts/CallContext.tsx`
- Function: `startCall`
- Line: 168
- Code: `const callId = \`${currentUserId}-${recipientId}-${Date.now()}\`;`

### 4.2 Call States

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
- `signalingState`: stable, have-local-offer, have-remote-offer, closed
- `iceConnectionState`: new, checking, connected, failed, disconnected, closed
- `connectionState`: new, connecting, connected, disconnected, failed, closed

### 4.3 State Transitions

**Outgoing Call:**
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

**Incoming Call:**
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

---

## 5. SIGNALING AUDIT

### 5.1 Socket.IO Events

**Client → Server:**

| Event | Émetteur | Payload | Handler Location | Validation |
|-------|-----------|---------|------------------|------------|
| `call:offer` | CallModal.tsx:514 | `{ callId, offer, recipientId }` | server.ts:1038 | callId string ≤256, recipientId string, offer object |
| `call:answer` | CallModal.tsx:775 | `{ callId, answer, recipientId }` | server.ts:1108 | callId string, recipientId string, answer object |
| `call:ice` | CallModal.tsx:427, 703 | `{ callId, candidate, recipientId }` | server.ts:1146 | callId string, recipientId string, candidate object |
| `call:end` | CallModal.tsx:839, IncomingCallModal.tsx:113 | `{ callId, recipientId }` | server.ts:1177 | callId string, recipientId string |
| `register` | lib/socket.ts:64 | `userId` | server.ts:808 | userId string |

**Server → Client:**

| Event | Émetteur | Récepteur | Payload | Listener Location |
|-------|-----------|---------|-------|------------------|
| `call:incoming` | server.ts:1069 | Recipient | `{ callId, offer, callerId, callerName, callerImage, callType }` | CallContext.tsx:102 |
| `call:answer` | server.ts:1133 | Caller | `{ callId, answer }` | CallModal.tsx:451 |
| `call:ice` | server.ts:1164 | Peer | `{ callId, candidate }` | CallModal.tsx:458, 804 |
| `call:end` | server.ts:1198 | Peer | `{ callId }` | CallModal.tsx:465, 811, IncomingCallModal.tsx:85 |
| `register:ack` | server.ts:841 | Client | `{ userId, socketId }` | lib/socket.ts:90 |

### 5.2 Server Handler Details

**call:offer Handler (server.ts:1038-1106)**

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

**Evidence:**
- File: `server.ts`
- Function: `socket.on("call:offer", ...)`
- Lines: 1038-1106

**call:answer Handler (server.ts:1108-1144)**

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
   - No queuing for answers

**Evidence:**
- File: `server.ts`
- Function: `socket.on("call:answer", ...)`
- Lines: 1108-1144

**call:ice Handler (server.ts:1146-1175)**

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

**Evidence:**
- File: `server.ts`
- Function: `socket.on("call:ice", ...)`
- Lines: 1146-1175

**call:end Handler (server.ts:1177-1208)**

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

**Evidence:**
- File: `server.ts`
- Function: `socket.on("call:end", ...)`
- Lines: 1177-1208

---

## 6. WEBRTC AUDIT

### 6.1 Peer Connection Configuration

**ICE Servers:**
```typescript
{
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" }
  ]
}
```

**Location:** CallModal.tsx:376-381 (outgoing), CallModal.tsx:662-667 (incoming)

**Assessment:**
- ✅ STUN servers configured for NAT traversal
- ❌ No TURN servers (will fail in symmetric NAT)
- ❌ No ICE transport policy (relies on browser default)

**Evidence:**
- File: `components/messaging/CallModal.tsx`
- Lines: 376-381, 662-667

### 6.2 Media Acquisition

**Constraints:**
```typescript
{
  audio: true,
  video: callType === "video"
}
```

**Location:** CallModal.tsx:349-352 (outgoing), CallModal.tsx:635-638 (incoming)

**Assessment:**
- ✅ Audio enabled
- ✅ Conditional video based on call type
- ❌ No specific video constraints (resolution, framerate)
- ❌ No audio processing constraints (echoCancellation, etc.)

**Evidence:**
- File: `components/messaging/CallModal.tsx`
- Lines: 349-352, 635-638

### 6.3 Track Management

**Local Tracks:**
- Added to PC via `pc.addTrack(track, stream)` (lines 413, 699)
- Stopped in cleanup via `track.stop()` (line 116)
- Muted via `track.enabled = false` (lines 851, 861)

**Remote Tracks:**
- Received via `pc.ontrack` event (lines 435, 711)
- Attached to `<video>` element via `srcObject = event.streams[0]` (lines 437, 713)
- No explicit track muting

**Evidence:**
- File: `components/messaging/CallModal.tsx`
- Lines: 413, 699, 435, 711, 116, 851, 861

### 6.4 Connection Monitoring

**Logged States:**
- `iceConnectionState` - ICE connection status (lines 385-390, 671-676)
- `connectionState` - Overall connection status (lines 392-397, 678-683)
- `signalingState` - SDP negotiation status (lines 399-404, 685-690)
- `iceGatheringState` - ICE gathering status (lines 406-411, 692-697)

**Assessment:**
- ✅ Comprehensive logging
- ❌ No automatic recovery actions
- ❌ No user feedback on connection issues

**Evidence:**
- File: `components/messaging/CallModal.tsx`
- Lines: 385-411, 671-697

---

## 7. ICE AUDIT

### 7.1 ICE Candidate Generation

**Emission:**
```typescript
pc.onicecandidate = (event) => {
  if (event.candidate) {
    socket.emit("call:ice", {
      callId: currentCallId,
      candidate: event.candidate,
      recipientId,
    });
  }
};
```

**Location:** CallModal.tsx:415-433 (outgoing), CallModal.tsx:701-709 (incoming)

**Assessment:**
- ✅ ICE candidates emitted to peer
- ✅ callId included for filtering
- ❌ No filtering by callId on server side

**Evidence:**
- File: `components/messaging/CallModal.tsx`
- Lines: 415-433, 701-709

### 7.2 ICE Candidate Reception

**Reception:**
```typescript
const handleIce = async ({ candidate, callId: eventCallId }) => {
  if (eventCallId && eventCallId !== currentCallId) {
    console.log("[CALL][IGNORE_FOREIGN_EVENT]", { event: "call:ice", eventCallId, currentCallId });
    return;
  }

  if (!pc.remoteDescription) {
    pendingIceCandidatesRef.current.push(candidate);
    return;
  }

  await pc.addIceCandidate(candidate);
};
```

**Location:** CallModal.tsx:575-608

**Assessment:**
- ✅ Queuing for early candidates
- ✅ Processing after remoteDescription set
- ✅ Error handling for addIceCandidate failures
- ✅ Foreign event filtering by callId

**Evidence:**
- File: `components/messaging/CallModal.tsx`
- Lines: 575-608

### 7.3 ICE Candidate Queuing

**Queue Mechanism:**
- Queue: `pendingIceCandidatesRef.current` (array)
- Condition: `!pc.remoteDescription`
- Processing: After `setRemoteDescription(answer)` or `setRemoteDescription(offer)`
- Cleanup: Cleared after processing (line 567, 739)

**Assessment:**
- ✅ Proper queuing for early candidates
- ✅ Proper processing after remote description
- ✅ Proper cleanup

**Evidence:**
- File: `components/messaging/CallModal.tsx`
- Lines: 45, 596-600, 558-567, 730-739

---

## 8. STATE MACHINE

### 8.1 Actual States (Derived from Code)

**CallContext States:**
```typescript
type CallContextState = 
  | "idle"           // No active or incoming call
  | "incoming"       // Incoming call received, awaiting user action
  | "active";        // Call in progress
```

**CallModal States:**
```typescript
type CallModalState = 
  | "closed"         // Modal not open
  | "initializing"   // Session token generated, media acquisition
  | "ringing"        // Offer sent/awaiting answer or incoming ringing
  | "connected"      // WebRTC connection established
  | "ending"         // Call termination in progress
  | "ended";         // Call terminated, cleanup complete
```

### 8.2 State Transitions

**Outgoing Call Transitions:**

| From | Event | To | Code Location | Persisted DB? |
| ---- | ----- | -- | -------------- | -------------- |
| idle | startCall called | initializing | CallContext.tsx:168 | ❌ NO |
| initializing | offer created | ringing | CallModal.tsx:494 | ❌ NO |
| ringing | answer received | connected | CallModal.tsx:556 | ❌ NO |
| connected | user hangs up | ending | CallModal.tsx:836 | ❌ NO |
| connected | call:end received | ending | CallModal.tsx:610 | ❌ NO |
| ending | cleanup complete | ended | CallModal.tsx:58 | ❌ NO |
| ended | modal closed | idle | CallModal.tsx:236 | ❌ NO |

**Incoming Call Transitions:**

| From | Event | To | Code Location | Persisted DB? |
| ---- | ----- | -- | -------------- | -------------- |
| idle | call:incoming received | incoming | CallContext.tsx:102 | ❌ NO |
| incoming | user accepts | initializing | CallContext.tsx:119 | ❌ NO |
| incoming | user rejects | idle | IncomingCallModal.tsx:112 | ❌ NO |
| incoming | call:end received | idle | IncomingCallModal.tsx:73 | ❌ NO |
| initializing | answer created | connected | CallModal.tsx:756 | ❌ NO |
| connected | user hangs up | ending | CallModal.tsx:836 | ❌ NO |
| connected | call:end received | ending | CallModal.tsx:610 | ❌ NO |
| ending | cleanup complete | ended | CallModal.tsx:58 | ❌ NO |
| ended | modal closed | idle | CallModal.tsx:236 | ❌ NO |

---

## 9. AUTHENTICATION AUDIT

### 9.1 Socket.IO Authentication

**Registration Process:**

**Client Side (lib/socket.ts:62-65):**
```typescript
if (userId && userId !== registeredUserIdRef.current && socket.connected) {
  console.log("[SOCKET][REGISTER]", { userId, socketId: socket.id });
  socket.emit("register", userId);
  registeredUserIdRef.current = userId;
}
```

**Server Side (server.ts:808-854):**
```typescript
socket.on("register", (userId: string) => {
  if (!userId) {
    return;
  }

  socket.join(`user:${userId}`);
  socket.data.userId = userId;

  // Also add to onlineUsers registry for call routing
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }

  onlineUsers.get(userId)!.add(socket.id);

  socket.emit("register:ack", { userId, socketId: socket.id });
  deliverPendingSignals(userId, socket.id);
});
```

**Assessment:**
- ❌ NO authentication on socket connection
- ❌ NO verification that userId is valid
- ❌ NO verification that user owns the userId
- ❌ Any socket can emit any userId via "register"
- ❌ Vulnerable to userId spoofing

**Evidence:**
- File: `lib/socket.ts`
- Lines: 62-65
- File: `server.ts`
- Lines: 808-854

### 9.2 Signaling Event Authentication

**call:offer Handler (server.ts:1038):**
```typescript
socket.on("call:offer", ({ callId, offer, recipientId, callerId, callerName, callerImage, callType }) => {
  // Validation: callId, recipientId, offer types only
  // NO verification that socket.data.userId matches callerId
  // NO verification that socket.data.userId is set
  
  const recipientSockets = getRecipientSockets(recipientId);
  // ...
});
```

**Assessment:**
- ❌ NO verification that socket.data.userId is set
- ❌ NO verification that socket.data.userId matches callerId
- ❌ NO verification that callerId is the authenticated user
- ❌ Vulnerable to call spoofing

**Evidence:**
- File: `server.ts`
- Lines: 1038-1106

**call:answer Handler (server.ts:1108):**
```typescript
socket.on("call:answer", ({ callId, answer, recipientId }) => {
  // Validation: callId, recipientId, answer types only
  // NO verification that socket.data.userId is set
  // NO verification that user is participant in call
  // ...
});
```

**Assessment:**
- ❌ NO verification that user is participant in call
- ❌ Vulnerable to unauthorized answer

**Evidence:**
- File: `server.ts`
- Lines: 1108-1144

**call:ice Handler (server.ts:1146):**
```typescript
socket.on("call:ice", ({ callId, candidate, recipientId }) => {
  // Validation: callId, recipientId, candidate types only
  // NO verification that user is participant in call
  // ...
});
```

**Assessment:**
- ❌ NO verification that user is participant in call
- ❌ Vulnerable to ICE injection

**Evidence:**
- File: `server.ts`
- Lines: 1146-1175

**call:end Handler (server.ts:1177):**
```typescript
socket.on("call:end", ({ callId, recipientId }) => {
  // Validation: callId, recipientId types only
  // NO verification that user is participant in call
  // NO verification that user has authority to end call
  // ...
});
```

**Assessment:**
- ❌ NO verification that user is participant in call
- ❌ NO verification that user has authority to end call
- ❌ Vulnerable to unauthorized call termination

**Evidence:**
- File: `server.ts`
- Lines: 1177-1208

---

## 10. AUTHORIZATION AUDIT

### 10.1 Who Can Send Events

**call:offer:**
- **Who can send:** ANY connected socket
- **Verification:** NONE (only type validation)
- **Can spoof callerId:** YES (payload not verified against socket.data.userId)
- **Can send for any recipientId:** YES (no authorization check)

**Evidence:**
- File: `server.ts`
- Lines: 1038-1106
- Code shows NO authorization checks

**call:answer:**
- **Who can send:** ANY connected socket
- **Verification:** NONE (only type validation)
- **Can answer any call:** YES (no verification that user is participant)
- **Can impersonate participant:** YES

**Evidence:**
- File: `server.ts`
- Lines: 1108-1144
- Code shows NO authorization checks

**call:ice:**
- **Who can send:** ANY connected socket
- **Verification:** NONE (only type validation)
- **Can inject ICE candidates:** YES (no verification that user is participant)

**Evidence:**
- File: `server.ts`
- Lines: 1146-1175
- Code shows NO authorization checks

**call:end:**
- **Who can send:** ANY connected socket
- **Verification:** NONE (only type validation)
- **Can end any call:** YES (no verification that user is participant)
- **Can terminate calls not involved in:** YES

**Evidence:**
- File: `server.ts`
- Lines: 1177-1208
- Code shows NO authorization checks

### 10.2 Server Identity Knowledge

**How server knows identity:**
- `socket.data.userId` set via "register" event
- NO verification that userId is valid
- NO verification that user owns the userId
- Any socket can emit any userId

**Comparison with payload:**
- `socket.data.userId` vs `payload.callerId`: NOT compared
- `socket.data.userId` vs `payload.recipientId`: NOT compared
- Server uses `socket.data.userId || callerId` as fallback

**Evidence:**
- File: `server.ts`
- Line: 1072, 1094, 1099
- Code: `callerId: socket.data.userId || callerId`

### 10.3 Spoofing Vulnerabilities

**Can send signal on behalf of another user:**
- ✅ YES - Any socket can emit any callerId in payload
- ✅ YES - Server does not verify payload against socket.data.userId
- ✅ YES - No authorization checks

**Can terminate call not participating in:**
- ✅ YES - call:end handler has no participant verification
- ✅ YES - Any socket can emit call:end for any callId

**Can inject ICE candidates:**
- ✅ YES - call:ice handler has no participant verification
- ✅ YES - Any socket can emit ICE candidates for any callId

**Evidence:**
- File: `server.ts`
- Lines: 1038-1208
- Code shows NO authorization or participant verification

---

## 11. SECURITY AUDIT

### 11.1 Authentication

**Status:** ❌ NOT IMPLEMENTED

**Findings:**
- NO authentication on socket connection
- NO verification of userId in "register" event
- NO verification that user owns the userId
- Any socket can register as any userId

**Vulnerability:** User ID Spoofing

**Evidence:**
- File: `server.ts`
- Lines: 808-854
- Code shows NO authentication

### 11.2 Authorization

**Status:** ❌ NOT IMPLEMENTED

**Findings:**
- NO verification that user is participant in call
- NO verification that user can call recipient
- NO blocklist/ignore list integration
- Any user can call any other user

**Vulnerability:** Unauthorized Call Access

**Evidence:**
- File: `server.ts`
- Lines: 1038-1208
- Code shows NO authorization checks

### 11.3 IDOR (Insecure Direct Object Reference)

**Status:** ❌ VULNERABLE

**Findings:**
- callId is client-generated
- NO verification that caller owns the callId
- NO verification that recipient is authorized
- Anyone can send signals for any callId

**Vulnerability:** Call Hijacking

**Evidence:**
- File: `contexts/CallContext.tsx`
- Line: 168
- Code: `const callId = \`${currentUserId}-${recipientId}-${Date.now()}\`;`

### 11.4 Spoofing

**Status:** ❌ VULNERABLE

**Findings:**
- callerId in payload not verified
- recipientId in payload not verified
- Anyone can spoof callerId
- Anyone can send signals on behalf of others

**Vulnerability:** Identity Spoofing

**Evidence:**
- File: `server.ts`
- Lines: 1072, 1094, 1099
- Code: `callerId: socket.data.userId || callerId`

### 11.5 Replay

**Status:** ⚠️ PARTIALLY PROTECTED

**Findings:**
- Session token prevents stale cleanup
- callId filtering prevents foreign events
- NO replay protection on signaling events
- NO timestamp validation

**Vulnerability:** Limited Replay Risk

**Evidence:**
- File: `components/messaging/CallModal.tsx`
- Lines: 540-543, 580-583, 614-617
- Code shows callId filtering

### 11.6 Call Hijacking

**Status:** ❌ VULNERABLE

**Findings:**
- NO verification that user is participant
- Anyone can send call:answer for any callId
- Anyone can send call:end for any callId

**Vulnerability:** Call Hijacking

**Evidence:**
- File: `server.ts`
- Lines: 1108-1208
- Code shows NO participant verification

### 11.7 Signal Injection

**Status:** ❌ VULNERABLE

**Findings:**
- NO verification of signal source
- Anyone can inject call:offer
- Anyone can inject call:answer
- Anyone can inject call:ice

**Vulnerability:** Signal Injection

**Evidence:**
- File: `server.ts`
- Lines: 1038-1175
- Code shows NO source verification

### 11.8 Call Spam

**Status:** ❌ VULNERABLE

**Findings:**
- NO rate limiting on call:offer
- NO rate limiting on call:answer
- NO rate limiting on call:ice
- NO rate limiting on call:end

**Vulnerability:** Call Spam / DoS

**Evidence:**
- File: `server.ts`
- Lines: 1038-1208
- Code shows NO rate limiting

### 11.9 DoS

**Status:** ❌ VULNERABLE

**Findings:**
- NO rate limiting on any signaling events
- NO per-user rate limits
- NO global rate limits
- Vulnerable to signaling flood

**Vulnerability:** DoS via Signaling Flood

**Evidence:**
- File: `server.ts`
- Lines: 1038-1208
- Code shows NO rate limiting

### 11.10 Payload Flooding

**Status:** ❌ VULNERABLE

**Findings:**
- NO payload size limits
- NO SDP size validation
- NO ICE candidate count limits

**Vulnerability:** Payload Flooding

**Evidence:**
- File: `server.ts`
- Lines: 1038-1208
- Code shows NO size limits

### 11.11 SDP Injection

**Status:** ⚠️ PARTIALLY PROTECTED

**Findings:**
- Type validation (must be object)
- NO semantic validation of SDP
- NO verification of SDP structure

**Vulnerability:** Limited SDP Injection Risk

**Evidence:**
- File: `server.ts`
- Lines: 1047-1050, 1117-1120, 1155-1158
- Code shows only type validation

### 11.12 ICE Flooding

**Status:** ❌ VULNERABLE

**Findings:**
- NO ICE candidate count limits
- NO rate limiting on call:ice
- Vulnerable to ICE candidate flood

**Vulnerability:** ICE Flooding

**Evidence:**
- File: `server.ts`
- Lines: 1146-1175
- Code shows NO limits

### 11.13 Unauthorized Call Termination

**Status:** ❌ VULNERABLE

**Findings:**
- NO verification that user is participant
- NO verification that user has authority
- Anyone can send call:end for any callId

**Vulnerability:** Unauthorized Call Termination

**Evidence:**
- File: `server.ts`
- Lines: 1177-1208
- Code shows NO verification

### 11.14 Enumeration

**Status:** ⚠️ PARTIALLY PROTECTED

**Findings:**
- callId is client-generated (predictable format)
- NO random callId generation
- Format: `${userId}-${recipientId}-${timestamp}`
- Could enumerate calls by guessing timestamps

**Vulnerability:** Limited Enumeration Risk

**Evidence:**
- File: `contexts/CallContext.tsx`
- Line: 168
- Code: `const callId = \`${currentUserId}-${recipientId}-${Date.now()}\`;`

### 11.15 Privacy

**Status:** ❌ SERVER CAN INSPECT ALL SIGNALING

**Findings:**
- Server receives all SDP offers/answers
- Server receives all ICE candidates
- Server can inspect IP addresses in ICE candidates
- NO end-to-end encryption
- Server is trusted party

**Vulnerability:** Privacy Exposure to Server

**Evidence:**
- File: `server.ts`
- Lines: 1038-1208
- Server relays all signaling

---

## 12. DATABASE INTEGRATION

### 12.1 Database Schema Status

**Migration SQL:**
- File: `prisma/migrations/20260827105539_add_call_tables/migration.sql`
- Status: EXISTS
- Tables: Call, CallParticipant
- Foreign keys: User references
- Indexes: callerId, recipientId, status

**Prisma Schema:**
- File: `prisma/schema.prisma`
- Status: Call models NOT FOUND
- Grep search: NO RESULTS
- Models: NOT DEFINED

**Evidence:**
- Migration SQL: EXISTS (lines 1-41)
- Schema.prisma: Call models NOT FOUND (grep returned NO results)

### 12.2 API Routes Status

**POST /api/calls:**
- File: `app/api/calls/route.ts`
- Status: EXISTS but BROKEN
- Code: `prisma.call.create(...)` - WILL FAIL (model not in schema)
- Called by: NONE (not called by frontend)

**Evidence:**
- File: `app/api/calls/route.ts`
- Lines: 45-52
- Code: `const call = await prisma.call.create({...})`

**PATCH /api/calls/[id]:**
- File: `app/api/calls/[id]/route.ts`
- Status: EXISTS but BROKEN
- Code: `prisma.call.findUnique(...)` - WILL FAIL (model not in schema)
- Code: `prisma.call.update(...)` - WILL FAIL (model not in schema)
- Called by: NONE (not called by frontend)

**Evidence:**
- File: `app/api/calls/[id]/route.ts`
- Lines: 42-62
- Code: `const call = await prisma.call.findUnique({...})`

### 12.3 Database vs Signaling Comparison

| Action | Socket | API | DB |
| ------ | ------ | --- | -- |
| Start call | ✅ YES (call:offer) | ❌ NO (not called) | ❌ NO (model missing) |
| Incoming | ✅ YES (call:incoming) | ❌ NO | ❌ NO (model missing) |
| Accept | ✅ YES (call:answer) | ❌ NO | ❌ NO (model missing) |
| Reject | ✅ YES (call:end) | ❌ NO | ❌ NO (model missing) |
| Connected | ✅ YES (WebRTC) | ❌ NO | ❌ NO (model missing) |
| End | ✅ YES (call:end) | ❌ NO | ❌ NO (model missing) |
| Missed | ❌ NO | ❌ NO | ❌ NO (model missing) |

**Evidence:**
- Socket: server.ts lines 1038-1208
- API: app/api/calls/route.ts, app/api/calls/[id]/route.ts (not called)
- DB: schema.prisma (models missing)

---

## 13. NOTIFICATION INTEGRATION

### 13.1 Notification Creation

**CallContext (client-side):**
```typescript
socket.emit("notification:new", {
  message: `Appel ${data.callType === "video" ? "vidéo" : "audio"} entrant de ${data.callerName || "quelqu'un"}`,
});
```

**Location:** CallContext.tsx:92-94

**Assessment:**
- ✅ Client-side notification emitted
- ❌ NOT persisted to database
- ❌ No notification type (CALL_INCOMING)
- ❌ No entity linking

**Evidence:**
- File: `contexts/CallContext.tsx`
- Lines: 92-94

**API Routes (server-side, but not called):**
- POST /api/calls creates CALL_INCOMING notification
- PATCH /api/calls/[id] creates CALL_MISSED and CALL_ENDED notifications
- These are NOT called by frontend

**Evidence:**
- File: `app/api/calls/route.ts`
- Lines: 54-62
- File: `app/api/calls/[id]/route.ts`
- Lines: 64-85

### 13.2 Notification Flow

**Actual Flow:**
```
CALL
 ↓
CallContext
 ↓
socket.emit("notification:new")
 ↓
Server (no handler for notification:new from client)
 ↓
NOT PERSISTED
```

**Intended Flow (not implemented):**
```
CALL
 ↓
POST /api/calls
 ↓
createNotification(CALL_INCOMING)
 ↓
DB
 ↓
Socket
 ↓
UI
```

**Evidence:**
- Actual: CallContext.tsx:92-94
- Intended: app/api/calls/route.ts:54-62 (not called)

---

## 14. DISCONNECT / RECONNECTION

### 14.1 Disconnect Handler

**Server Side (server.ts):**
- ❌ NO specific disconnect handler for calls
- ❌ NO call cleanup on disconnect
- ❌ NO notification to peer on disconnect

**Evidence:**
- File: `server.ts`
- Grep for "disconnect" in server.ts: Only found in getRecipientSockets cleanup (line 249)
- NO call-specific disconnect handler

**Legacy Server (server/socket.ts):**
```typescript
socket.on("disconnect", () => {
  for (const [userId, sockets] of onlineUsers.entries()) {
    sockets.delete(socket.id);
    if (sockets.size === 0) {
      onlineUsers.delete(userId);
    }
  }
  io.emit("presence:update", getOnlineUsers());
});
```

**Location:** server/socket.ts:271-283

**Assessment:**
- ✅ Disconnect handler exists in legacy server
- ❌ NO call cleanup
- ❌ NO peer notification
- ❌ Legacy server appears unused

**Evidence:**
- File: `server/socket.ts`
- Lines: 271-283

### 14.2 Reconnection Handler

**Client Side (lib/socket.ts):**
```typescript
socket.on("reconnect", (attemptNumber) => {
  console.log("[CALL][SOCKET][RECONNECT]", { socketId: socketInstance?.id, attemptNumber });
});
```

**Location:** lib/socket.ts:40-42

**Assessment:**
- ✅ Reconnection event logged
- ❌ NO call-specific reconnection handling
- ❌ NO WebRTC connection restoration
- ❌ NO signaling state synchronization

**Evidence:**
- File: `lib/socket.ts`
- Lines: 40-42

**CallModal:**
- ❌ NO reconnection handlers
- ❌ NO socket listeners re-registered after reconnect
- ❌ NO WebRTC connection recovery

**Evidence:**
- File: `components/messaging/CallModal.tsx`
- Grep for "reconnect": NO RESULTS

### 14.3 Network Interruption

**Status:** ❌ NOT HANDLED

**Findings:**
- NO network quality monitoring
- NO handling for WiFi → cellular switch
- NO handling for temporary network loss
- NO handling for high latency
- NO handling for packet loss

**Evidence:**
- File: `components/messaging/CallModal.tsx`
- Grep for "network", "latency", "packet": NO RESULTS

---

## 15. NETWORK RESILIENCE

### 15.1 Connection Monitoring

**Status:** ⚠️ LOGGING ONLY

**Findings:**
- WebRTC states logged (iceConnectionState, connectionState, signalingState)
- NO automatic recovery actions
- NO user feedback on connection issues
- NO fallback mechanisms

**Evidence:**
- File: `components/messaging/CallModal.tsx`
- Lines: 385-411, 671-697

### 15.2 ICE Failure Handling

**Status:** ⚠️ PARTIAL

**Findings:**
- ICE connection state logged
- NO automatic retry on ICE failure
- NO fallback to TURN
- NO user notification on ICE failure

**Evidence:**
- File: `components/messaging/CallModal.tsx`
- Lines: 385-390, 671-676

### 15.3 Media Failure Handling

**Status:** ⚠️ PARTIAL

**Findings:**
- getUserMedia errors caught
- Cleanup on error
- NO retry on permission denial
- NO fallback if camera unavailable
- NO fallback if microphone unavailable

**Evidence:**
- File: `components/messaging/CallModal.tsx`
- Lines: 527-531, 814-818

---

## 16. MULTI-TAB ANALYSIS

### 16.1 Coordination Mechanisms

**Status:** ❌ NOT IMPLEMENTED

**Findings:**
- NO BroadcastChannel usage
- NO localStorage coordination
- NO SharedWorker usage
- NO Web Locks API usage

**Evidence:**
- Grep for "BroadcastChannel": NO RESULTS in call-related files
- Grep for "localStorage" in call files: NO RESULTS
- Grep for "SharedWorker": NO RESULTS
- Grep for "Web Locks": NO RESULTS

### 16.2 Multi-Tab Behavior

**Scenario A: Two tabs receive same call**
- ✅ Both tabs receive call:incoming
- ✅ Both tabs show IncomingCallModal
- ❌ NO coordination to prevent duplicate modals
- ❌ Both tabs can accept independently

**Evidence:**
- File: `contexts/CallContext.tsx`
- Lines: 72-110
- Each tab has independent CallContext

**Scenario B: Two tabs initiate call simultaneously**
- ✅ Both tabs can call startCall()
- ❌ NO coordination to prevent duplicate calls
- ❌ Both calls could be initiated

**Evidence:**
- File: `contexts/CallContext.tsx`
- Lines: 141-196
- Protection only within single tab (startingCallRef, activeCallRef)

**Scenario C: One tab hangs up**
- ❌ Other tab NOT notified
- ❌ Other tab continues call
- ❌ State inconsistency

**Evidence:**
- File: `components/messaging/CallModal.tsx`
- NO cross-tab communication

**Scenario D: One tab closes**
- ❌ Other tab NOT notified
- ❌ Other tab continues call
- ❌ State inconsistency

**Evidence:**
- File: `components/messaging/CallModal.tsx`
- NO cross-tab communication

**Scenario E: One tab connected, other not**
- ❌ NO coordination
- ❌ Independent states

**Evidence:**
- File: `contexts/CallContext.tsx`
- NO cross-tab communication

---

## 17. OFFLINE / ONLINE BEHAVIOR

### 17.1 Online Users Registry

**Implementation:**
```typescript
const onlineUsers = new Map<string, Set<string>>();
```

**Location:** server.ts:90

**Registration:**
```typescript
socket.on("register", (userId: string) => {
  socket.join(`user:${userId}`);
  socket.data.userId = userId;
  
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  
  onlineUsers.get(userId)!.add(socket.id);
  deliverPendingSignals(userId, socket.id);
});
```

**Location:** server.ts:808-854

**Assessment:**
- ✅ Multi-socket support (Set of socketIds per userId)
- ✅ Room-based routing (`user:{userId}`)
- ✅ Pending signal delivery on registration
- ❌ In-memory only (not shared across instances)

**Evidence:**
- File: `server.ts`
- Lines: 90, 808-854

### 17.2 Pending Signals Queue

**Implementation:**
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

const pendingSignals = new Map<string, PendingSignal[]>();
const SIGNAL_EXPIRY_MS = 60000; // 60 seconds
```

**Location:** server.ts:96-107

**Queue Conditions:**
- Only `call:offer` is queued (lines 1091-1104)
- Answers/ICE/end NOT queued (assumes recipient must be online)
- Queued when recipient not in onlineUsers registry
- Delivered when recipient registers via `register` event

**Cleanup:**
- Expired signals removed on `addPendingSignal()` (lines 144-163)
- All signals removed after delivery in `deliverPendingSignals()` (lines 165-189)

**Assessment:**
- ✅ Offer queuing implemented
- ✅ 60s expiry
- ✅ Cleanup on expiry
- ✅ Delivery on registration
- ❌ Only offers queued (answers/ICE/end not queued)
- ❌ In-memory only (not shared across instances)

**Evidence:**
- File: `server.ts`
- Lines: 96-189

### 17.3 Offline Behavior

**Recipient Offline:**
- ✅ Offer queued for 60s
- ✅ Warning logged: RECIPIENT_NOT_REGISTERED
- ❌ Answer NOT queued (will fail)
- ❌ ICE NOT queued (will fail)
- ❌ End NOT queued (will fail)

**Evidence:**
- File: `server.ts`
- Lines: 1084-1105 (offer queuing)
- Lines: 1138-1143 (answer not queued)
- Lines: 1169-1174 (ICE not queued)
- Lines: 1202-1207 (end not queued)

**Recipient Reconnects:**
- ✅ Pending signals delivered via `deliverPendingSignals()`
- ✅ Expired signals filtered out
- ❌ Only offers delivered (answers/ICE/end lost)

**Evidence:**
- File: `server.ts`
- Lines: 165-189

**Caller Disconnects:**
- ❌ NO notification to recipient
- ❌ NO call cleanup
- ❌ Recipient left hanging

**Evidence:**
- File: `server.ts`
- NO disconnect handler for calls

**Recipient Disconnects:**
- ❌ NO notification to caller
- ❌ NO call cleanup
- ❌ Caller left hanging

**Evidence:**
- File: `server.ts`
- NO disconnect handler for calls

---

## 18. SCALABILITY

### 18.1 State Sharing

**In-Memory State:**
- `onlineUsers`: Map<string, Set<string>> (server.ts:90)
- `pendingSignals`: Map<string, PendingSignal[]> (server.ts:106)
- `radioParticipants`: Map<string, Map<string, RadioParticipant>> (server.ts:80-84)

**Assessment:**
- ❌ All state in-memory
- ❌ NOT shared across instances
- ❌ Requires sticky sessions if scaled
- ❌ Single point of failure

**Evidence:**
- File: `server.ts`
- Lines: 90, 106, 80-84

### 18.2 Multi-Instance Support

**Status:** ❌ NOT SUPPORTED

**Findings:**
- NO Redis adapter for Socket.IO
- NO shared state mechanism
- NO horizontal scaling support
- Would require significant refactoring

**Evidence:**
- File: `server.ts`
- Lines: 1-100 (no Redis adapter)
- Grep for "redis": NO RESULTS

### 18.3 Resource Management

**Memory:**
- onlineUsers: grows with active users
- pendingSignals: grows with offline users
- radioParticipants: grows with radio sessions

**Cleanup:**
- ✅ onlineUsers cleaned on disconnect (server/socket.ts:271-283)
- ✅ pendingSignals cleaned on expiry (server.ts:144-163)
- ✅ pendingSignals cleaned on delivery (server.ts:165-189)
- ❌ NO periodic cleanup for stale entries
- ❌ NO memory limits or monitoring

**Evidence:**
- File: `server.ts`
- Lines: 144-189
- File: `server/socket.ts`
- Lines: 271-283

---

## 19. LEGACY / DUPLICATE SYSTEMS

### 19.1 Duplicate Socket.IO Servers

**server.ts (ACTIVE):**
- Lines: 1038-1208 (call handlers)
- Lines: 808-854 (register handler)
- Status: ACTIVE
- Used by: Frontend

**server/socket.ts (LEGACY):**
- Lines: 79-232 (call handlers)
- Lines: 40-48 (user:online handler)
- Lines: 271-283 (disconnect handler)
- Status: LEGACY / DUPLICATE
- Used by: UNKNOWN (appears unused)

**Assessment:**
- ❌ Duplicate implementation
- ❌ Maintenance burden
- ❌ Potential confusion
- ⚠️ server/socket.ts has disconnect handler (missing in server.ts)

**Evidence:**
- File: `server.ts`
- Lines: 1038-1208
- File: `server/socket.ts`
- Lines: 79-232

### 19.2 API Routes

**POST /api/calls:**
- Status: EXISTS but BROKEN
- Issue: prisma.call not in schema
- Called by: NONE

**PATCH /api/calls/[id]:**
- Status: EXISTS but BROKEN
- Issue: prisma.call not in schema
- Called by: NONE

**Assessment:**
- ❌ Cannot function (models missing)
- ❌ Not integrated with call system
- ❌ Dead code

**Evidence:**
- File: `app/api/calls/route.ts`
- File: `app/api/calls/[id]/route.ts`
- File: `prisma/schema.prisma` (models missing)

---

## 20. VALIDATION OF PREVIOUS AUDIT

### 20.1 Previous Audit Claims

| Finding | Verdict | Preuve |
| ------- | ------ | ------ |
| Signaling exists | CONFIRMED | server.ts:1038-1208 |
| No DB integration | CONFIRMED | schema.prisma: models NOT FOUND |
| No authentication | CONFIRMED | server.ts: NO auth checks |
| No disconnect handling | CONFIRMED | server.ts: NO disconnect handler for calls |
| No multi-tab | CONFIRMED | NO BroadcastChannel/localStorage |
| No TURN | CONFIRMED | Only STUN servers configured |
| Database models exist | CONTRADICTED | Migration EXISTS but schema.prisma MISSING |
| API routes functional | CONTRADICTED | Routes exist but prisma.call NOT in schema |
| Pending signals implemented | CONFIRMED | server.ts:96-189 |
| Session token cleanup | CONFIRMED | CallModal.tsx:58-167 |

### 20.2 New Findings

**Critical New Finding:**
- Database models Call and CallParticipant NOT in schema.prisma
- API routes will FAIL at runtime
- Migration exists but models inaccessible to Prisma

**New Finding:**
- Duplicate Socket.IO server implementation in server/socket.ts
- Legacy server has disconnect handler (missing in active server)

**New Finding:**
- Only call:offer is queued for offline users
- call:answer, call:ice, call:end NOT queued

---

## 21. CONFIRMED DEFECTS

### 21.1 Critical Defects

**1. Database Models Missing from Schema**
- **Type:** CRITICAL
- **Location:** prisma/schema.prisma
- **Issue:** Call and CallParticipant models NOT defined
- **Impact:** API routes will FAIL at runtime
- **Evidence:** Grep search returned NO results for "model Call" in schema.prisma
- **Preuve:** Migration SQL exists (prisma/migrations/20260827105539_add_call_tables/migration.sql) but models not in schema

**2. No Authentication on Signaling**
- **Type:** CRITICAL
- **Location:** server.ts:1038-1208
- **Issue:** NO verification of socket.data.userId
- **Impact:** Any socket can send signaling events
- **Evidence:** server.ts lines 1038-1208 show NO auth checks

**3. No Authorization on Signaling**
- **Type:** CRITICAL
- **Location:** server.ts:1038-1208
- **Issue:** NO verification that user is participant in call
- **Impact:** Anyone can send signals for any call
- **Evidence:** server.ts lines 1038-1208 show NO authorization checks

**4. No Disconnect Handling for Calls**
- **Type:** CRITICAL
- **Location:** server.ts
- **Issue:** NO disconnect handler for active calls
- **Impact:** Peer not notified when user disconnects
- **Evidence:** Grep for "disconnect" in server.ts shows NO call-specific handler

**5. No Reconnection Logic**
- **Type:** CRITICAL
- **Location:** CallModal.tsx
- **Issue:** NO reconnection handlers
- **Impact:** Call fails on socket reconnect
- **Evidence:** Grep for "reconnect" in CallModal.tsx returned NO RESULTS

### 21.2 High Severity Defects

**6. No Rate Limiting on Signaling**
- **Type:** HIGH
- **Location:** server.ts:1038-1208
- **Issue:** NO rate limiting on call events
- **Impact:** Vulnerable to DoS via signaling flood
- **Evidence:** server.ts lines 1038-1208 show NO rate limiting

**7. No Multi-Tab Coordination**
- **Type:** HIGH
- **Location:** CallContext.tsx
- **Issue:** NO cross-tab communication
- **Impact:** Duplicate calls across tabs
- **Evidence:** Grep for "BroadcastChannel" returned NO RESULTS

**8. API Routes Not Integrated**
- **Type:** HIGH
- **Location:** CallContext.tsx, CallModal.tsx
- **Issue:** API routes not called by frontend
- **Impact:** No call persistence
- **Evidence:** Grep for "/api/calls" in call files returned NO RESULTS

**9. Only Offers Queued for Offline Users**
- **Type:** HIGH
- **Location:** server.ts:1091-1104
- **Issue:** Answers/ICE/end NOT queued
- **Impact:** Signals lost if recipient offline during call
- **Evidence:** server.ts lines 1138-1143, 1169-1174, 1202-1207 show NO queuing

### 21.3 Medium Severity Defects

**10. No TURN Servers**
- **Type:** MEDIUM
- **Location:** CallModal.tsx:376-381, 662-667
- **Issue:** Only STUN servers configured
- **Impact:** Calls fail in symmetric NAT
- **Evidence:** ICE config only includes STUN servers

**11. No Network Quality Monitoring**
- **Type:** MEDIUM
- **Location:** CallModal.tsx
- **Issue:** No network quality feedback
- **Impact:** Poor UX on bad networks
- **Evidence:** Only logging, no user feedback

**12. Client-Side Call ID Generation**
- **Type:** MEDIUM
- **Location:** CallContext.tsx:168
- **Issue:** callId not synchronized with database
- **Impact:** Potential call ID mismatch
- **Evidence:** callId generated client-side with template

### 21.4 Low Severity Defects

**13. No Error Recovery**
- **Type:** LOW
- **Location:** CallModal.tsx
- **Issue:** No retry logic for transient failures
- **Impact:** Calls fail on transient errors
- **Evidence:** Error handling only logs and cleans up

**14. No User Feedback on Connection Issues**
- **Type:** LOW
- **Location:** CallModal.tsx
- **Issue:** No user-facing error messages
- **Impact:** Poor UX on connection problems
- **Evidence:** Only console logging

**15. Limited Logging**
- **Type:** LOW
- **Location:** server.ts
- **Issue:** Basic logging only
- **Impact:** Difficult to debug issues
- **Evidence:** Console.log statements only

---

## 22. CONFIRMED LIMITATIONS

### 22.1 Functional Limitations

**1. No Call History**
- **Type:** LIMITATION
- **Reason:** Database models missing
- **Impact:** No call history tracking

**2. No Missed Call Detection**
- **Type:** LIMITATION
- **Reason:** No database integration
- **Impact:** No missed call notifications

**3. No Call Recording**
- **Type:** LIMITATION
- **Reason:** Not implemented
- **Impact:** No call recording capability

**4. No Call Transfer**
- **Type:** LIMITATION
- **Reason:** Not implemented
- **Impact:** No call transfer capability

**5. No Call Conferencing**
- **Type:** LIMITATION
- **Reason:** P2P only
- **Impact:** Only 1-1 calls supported

### 22.2 Technical Limitations

**6. No Multi-Instance Support**
- **Type:** LIMITATION
- **Reason:** In-memory state
- **Impact:** Cannot scale horizontally

**7. No End-to-End Encryption**
- **Type:** LIMITATION
- **Reason:** Server relays signaling
- **Impact:** Server can inspect all signaling

**8. No Adaptive Bitrate**
- **Type:** LIMITATION
- **Reason:** Not implemented
- **Impact:** No bandwidth adaptation

---

## 23. TECHNICAL DEBT

### 23.1 Architecture Debt

**1. Duplicate Socket.IO Servers**
- **Type:** TECHNICAL DEBT
- **Location:** server.ts and server/socket.ts
- **Issue:** Duplicate call handlers
- **Impact:** Maintenance burden, confusion

**2. API Routes Not Integrated**
- **Type:** TECHNICAL DEBT
- **Location:** app/api/calls/
- **Issue:** Dead code
- **Impact:** Code bloat, confusion

**3. Database Schema Inconsistency**
- **Type:** TECHNICAL DEBT
- **Location:** Migration vs Schema
- **Issue:** Models in migration but not in schema
- **Impact:** Runtime errors, confusion

### 23.2 Code Quality Debt

**4. No Type Safety on Payloads**
- **Type:** TECHNICAL DEBT
- **Location:** server.ts handlers
- **Issue:** Only type validation, no semantic validation
- **Impact:** Runtime errors possible

**5. No Error Handling in Handlers**
- **Type:** TECHNICAL DEBT
- **Location:** server.ts handlers
- **Issue:** No try-catch blocks
- **Impact:** Server crashes possible

**6. No Structured Logging**
- **Type:** TECHNICAL DEBT
- **Location:** server.ts
- **Issue:** Console.log only
- **Impact:** Difficult debugging

---

## 24. RISK MATRIX

| ID | Problème | Type | Sévérité | Impact | Probabilité | Preuve |
| -- | -------- | ---- | -------- | ------ | ----------- | ------ |
| 1 | Database models missing from schema | BUG | CRITICAL | Runtime failure | CERTAIN | schema.prisma grep NO results |
| 2 | No authentication on signaling | VULNÉRABILITÉ | CRITICAL | Unauthorized access | HIGH | server.ts NO auth checks |
| 3 | No authorization on signaling | VULNÉRABILITÉ | CRITICAL | Call hijacking | HIGH | server.ts NO auth checks |
| 4 | No disconnect handling | BUG | CRITICAL | Calls don't terminate | HIGH | server.ts NO disconnect handler |
| 5 | No reconnection logic | BUG | CRITICAL | Calls fail on reconnect | HIGH | CallModal NO reconnect handlers |
| 6 | No rate limiting | VULNÉRABILITÉ | HIGH | DoS vulnerability | HIGH | server.ts NO rate limiting |
| 7 | No multi-tab coordination | BUG | HIGH | Duplicate calls | MEDIUM | NO BroadcastChannel |
| 8 | API routes not integrated | DETTE TECHNIQUE | HIGH | Dead code | CERTAIN | API routes not called |
| 9 | Only offers queued | BUG | HIGH | Signals lost | MEDIUM | server.ts lines 1138-1143 |
| 10 | No TURN servers | LIMITATION | MEDIUM | NAT traversal failure | MEDIUM | ICE config STUN only |
| 11 | No network monitoring | LIMITATION | MEDIUM | Poor UX | LOW | Only logging |
| 12 | Client-side callId | LIMITATION | MEDIUM | ID mismatch | LOW | CallContext.tsx:168 |
| 13 | No error recovery | LIMITATION | LOW | Transient failures | LOW | No retry logic |
| 14 | No user feedback | LIMITATION | LOW | Poor UX | LOW | Only console logs |
| 15 | Duplicate servers | DETTE TECHNIQUE | LOW | Maintenance burden | CERTAIN | server.ts + server/socket.ts |

---

## 25. COVERAGE MATRIX

| Domaine | Existe | Fonctionnel selon code | Sécurisé | Persisté | Résilient |
| -------------- | -----: | ---------------------: | -------: | -------: | --------: |
| Outgoing call | ✅ | ✅ | ❌ | ❌ | ⚠️ |
| Incoming call | ✅ | ✅ | ❌ | ❌ | ⚠️ |
| Accept | ✅ | ✅ | ❌ | ❌ | ⚠️ |
| Reject | ✅ | ✅ | ❌ | ❌ | ⚠️ |
| Cancel | ❌ | ❌ | ❌ | ❌ | ❌ |
| End | ✅ | ✅ | ❌ | ❌ | ⚠️ |
| WebRTC | ✅ | ✅ | ⚠️ | N/A | ⚠️ |
| ICE | ✅ | ✅ | ⚠️ | N/A | ⚠️ |
| Disconnect | ⚠️ | ❌ | N/A | N/A | ❌ |
| Reconnect | ⚠️ | ❌ | N/A | N/A | ❌ |
| Offline | ✅ | ⚠️ | N/A | ❌ | ⚠️ |
| Multi-tab | ❌ | ❌ | N/A | N/A | ❌ |
| Authentication | ❌ | ❌ | ❌ | N/A | N/A |
| Authorization | ❌ | ❌ | ❌ | N/A | N/A |
| Rate limiting | ❌ | ❌ | ❌ | N/A | N/A |
| Database | ❌ | ❌ | N/A | ❌ | N/A |
| Notifications | ✅ | ⚠️ | N/A | ❌ | N/A |

**Legend:**
- ✅ = Implemented and functional
- ⚠️ = Partially implemented
- ❌ = Not implemented
- N/A = Not applicable

---

## 26. ARCHITECTURE TARGET

### 26.1 Proposed Architecture

```
Call Domain
├── CallSession
│   ├── Session management (creation, lifecycle, cleanup)
│   ├── Session token validation
│   ├── Multi-tab coordination
│   └── State persistence
├── CallSignaling
│   ├── Socket.IO signaling handlers
│   ├── Authentication verification
│   ├── Authorization checks
│   ├── Rate limiting
│   └── Message validation
├── CallPersistence
│   ├── Database models (Call, CallParticipant)
│   ├── API integration
│   ├── Call history tracking
│   └── Status synchronization
├── CallAuthorization
│   ├── Participant verification
│   ├── Blocklist/ignore list
│   ├── Privacy controls
│   └── Consent management
├── CallPresence
│   ├── Online users registry
│   ├── Multi-instance support (Redis)
│   ├── Pending signals queue
│   └── Disconnect handling
├── CallRecovery
│   ├── Reconnection logic
│   ├── WebRTC restoration
│   ├── State synchronization
│   └── Network resilience
└── CallNotifications
    ├── Incoming call notifications
    ├── Missed call notifications
    ├── Call ended notifications
    └── Notification persistence
```

### 26.2 Responsibilities

**CallSession:**
- Manage call session lifecycle
- Generate server-side callId
- Validate session tokens
- Coordinate multi-tab state
- Handle session cleanup

**CallSignaling:**
- Relay WebRTC signaling
- Verify authentication
- Enforce authorization
- Apply rate limiting
- Validate message payloads

**CallPersistence:**
- Persist call records to database
- Track call status transitions
- Maintain call history
- Synchronize signaling with database

**CallAuthorization:**
- Verify participant身份
- Enforce blocklist/ignore list
- Implement privacy controls
- Manage consent

**CallPresence:**
- Track online users
- Support multi-instance (Redis)
- Queue pending signals
- Handle disconnect gracefully

**CallRecovery:**
- Handle socket reconnection
- Restore WebRTC connection
- Synchronize state after reconnect
- Implement network resilience

**CallNotifications:**
- Create call notifications
- Persist notifications to database
- Deliver real-time notifications
- Track notification status

---

## 27. RECOMMENDED CORRECTION PHASES

### PHASE 1: CRITICAL - Database Schema Fix
**Priority:** CRITICAL
**Goal:** Fix database schema inconsistency

**Actions:**
1. Add Call and CallParticipant models to schema.prisma
2. Run `npx prisma generate`
3. Verify API routes can access models
4. Test API routes manually

**Estimated Time:** 2 hours

### PHASE 2: CRITICAL - Security Hardening
**Priority:** CRITICAL
**Goal:** Add authentication and authorization

**Actions:**
1. Add NextAuth session verification to socket connection
2. Verify socket.data.userId against session
3. Add authorization checks to all call handlers
4. Verify participant身份 before allowing signaling
5. Add callerId verification in call:offer handler

**Estimated Time:** 4 hours'

### PHASE 3: CRITICAL - Disconnect/Reconnection
**Priority:** CRITICAL
**Goal:** Handle disconnect and reconnection

**Actions:**
1. Add disconnect handler for active calls
2. Notify peer on disconnect
3. Add reconnection handlers in CallModal
4. Re-establish signaling state after reconnect
5. Consider WebRTC connection restoration

**Estimated Time:** 6 hours

### PHASE 4: HIGH - Database Integration
**Priority:** HIGH
**Goal:** Integrate database with call system

**Actions:**
1. Call POST /api/calls before emitting call:offer
2. Use server-generated callId
3. Call PATCH /api/calls/[id] on state changes
4. Track call lifecycle in database
5. Implement missed call detection

**Estimated Time:** 4 hours

### PHASE 5: HIGH - Rate Limiting
**Priority:** HIGH
**Goal:** Add rate limiting to signaling events

**Actions:**
1. Add rate limiting to call:offer
2. Add rate limiting to call:answer
3. Add rate limiting to call:ice
4. Add rate limiting to call:end
5. Implement per-user and global limits

**Estimated Time:** 3 hours

### PHASE 6: HIGH - Multi-Tab Coordination
**Priority:** HIGH
**Goal:** Add cross-tab coordination

**Actions:**
1. Implement BroadcastChannel for cross-tab communication
2. Prevent duplicate calls across tabs
3. Coordinate incoming call display
4. Synchronize call state across tabs

**Estimated Time:** 4 hours

### PHASE 7: MEDIUM - Network Resilience
**Priority:** MEDIUM
**Goal:** Improve network resilience

**Actions:**
1. Add TURN servers
2. Implement network quality monitoring
3. Add user feedback on connection issues
4. Implement retry logic for transient failures

**Estimated Time:** 4 hours

### PHASE 8: MEDIUM - Legacy Code Cleanup
**Priority:** MEDIUM
**Goal:** Remove duplicate/legacy code

**Actions:**
1. Determine if server/socket.ts is used
2. If unused, remove server/socket.ts
3. If used, consolidate with server.ts
4. Remove or integrate API routes

**Estimated Time:** 2 hours

### PHASE 9: LOW - Scalability
**Priority:** LOW
**Goal:** Add multi-instance support

**Actions:**
1. Add Redis adapter for Socket.IO
2. Move onlineUsers to Redis
3. Move pendingSignals to Redis
4. Test horizontal scaling

**Estimated Time:** 8 hours

### PHASE 10: LOW - Testing
**Priority:** LOW
**Goal:** Add comprehensive testing

**Actions:**
1. Add unit tests for handlers
2. Add integration tests for call flows
3. Add E2E tests for complete scenarios
4. Add security tests

**Estimated Time:** 16 hours

---

## 28. TEST PLAN

### 28.1 Functional Tests

**Outgoing Call:**
- Test call initiation
- Test offer creation
- Test answer reception
- Test ICE exchange
- Test connection establishment
- Test call termination

**Incoming Call:**
- Test call reception
- Test accept flow
- Test reject flow
- Test caller cancellation
- Test missed call

**WebRTC:**
- Test peer connection creation
- Test media acquisition
- Test track management
- Test ICE candidate exchange
- Test connection states

### 28.2 Network Tests

**Offline Recipient:**
- Test call to offline user
- Test signal queuing
- Test signal delivery on reconnect
- Test signal expiry

**Socket Disconnect:**
- Test disconnect during call
- Test peer notification
- Test call cleanup
- Test reconnection

**Network Interruption:**
- Test WiFi loss
- Test network switch
- Test high latency
- Test packet loss

### 28.3 Security Tests

**Authentication:**
- Test unauthorized socket connection
- Test userId spoofing
- Test session hijacking

**Authorization:**
- Test unauthorized call initiation
- Test call hijacking
- Test unauthorized call termination
- Test signal injection

**Rate Limiting:**
- Test call:offer flood
- Test call:ice flood
- Test DoS attempts

### 28.4 Multi-Tab Tests

**Duplicate Incoming Call:**
- Test two tabs receiving same call
- Test duplicate modal prevention
- Test accept coordination

**Simultaneous Outgoing Calls:**
- Test two tabs initiating calls
- Test duplicate call prevention

**Tab Closure:**
- Test tab closure during call
- Test state synchronization
- Test call continuation

### 28.5 Persistence Tests

**Call Creation:**
- Test POST /api/calls
- Test database record creation
- Test notification creation

**Status Updates:**
- Test PATCH /api/calls/[id]
- Test status transitions
- Test endedAt timestamp

**Call History:**
- Test call history retrieval
- Test missed call detection

---

## 29. FINAL VERDICT

### SYSTEM STATUS: **BROKEN**

**Reason:** Database models Call and CallParticipant NOT in schema.prisma, causing API routes to fail at runtime.

### SECURITY STATUS: **CRITICAL**

**Reason:** No authentication or authorization on signaling events, allowing anyone to send signals for any call.

### FUNCTIONAL STATUS: **PARTIALLY FUNCTIONAL**

**Reason:** Basic signaling works but lacks persistence, authentication, authorization, and resilience features.

### DATA INTEGRITY STATUS: **BROKEN**

**Reason:** Database models missing, no call persistence, no audit trail.

### NETWORK RESILIENCE: **POOR**

**Reason:** No disconnect handling, no reconnection logic, no TURN servers, no network monitoring.

### SCALABILITY: **POOR**

**Reason:** In-memory state only, no multi-instance support, no Redis.

### ARCHITECTURAL QUALITY: **POOR**

**Reason:** Duplicate server implementations, dead code, schema inconsistency, no separation of concerns.

### OVERALL RISK: **CRITICAL**

**Reason:** Critical security vulnerabilities, broken database integration, poor resilience, poor scalability.

---

## GO / NO-GO

### NO-GO — CRITICAL BLOCKERS

**Justification:**

1. **Database models missing from schema.prisma** - API routes will FAIL at runtime
2. **No authentication on signaling** - Critical security vulnerability
3. **No authorization on signaling** - Critical security vulnerability
4. **No disconnect handling** - Calls don't terminate properly
5. **No reconnection logic** - Calls fail on network issues

**Recommendation:**

DO NOT proceed with production deployment. Address critical blockers first:

1. Fix database schema (add models to schema.prisma)
2. Add authentication to signaling events
3. Add authorization to signaling events
4. Add disconnect handling
5. Add reconnection logic

After critical blockers are resolved, proceed with high-priority phases (database integration, rate limiting, multi-tab coordination).

---

**END OF FORENSIC VALIDATION REPORT**

**Audit Confirmation:** NO modifications were made to the codebase during this audit. All findings are based solely on static code analysis. Git status: NO CHANGES.
