# ChurchFace Mobile Live - Documentation

## Overview

ChurchFace Mobile Live is an instant live streaming feature that allows users to broadcast from their smartphone, tablet, or computer in seconds without using Studio Pro. It provides a Facebook Live, Instagram Live, or TikTok Live-like experience while integrating seamlessly with the existing ChurchFace architecture.

## Architecture

### Domain Structure

```
lib/mobilelive/
├── MobileLiveTypes.ts          # TypeScript types and interfaces
├── MobileLivePermissionService.ts  # Authorization and permissions
└── MobileLiveService.ts        # Core streaming logic
```

### API Routes

```
app/api/mobilelive/
├── permissions/route.ts         # Check user permissions
├── session/route.ts            # Create new session
├── session/[sessionId]/
│   ├── route.ts                # Get/update session
│   ├── start/route.ts          # Start live stream
│   ├── stop/route.ts           # Stop live stream
│   └── livekit-token/route.ts  # Generate LiveKit token
```

### Components

```
components/mobilelive/
├── GoLiveButton.tsx            # "Go Live" button component
├── MobileLiveSetup.tsx         # Pre-stream setup interface
└── MobileLiveInterface.tsx     # During-stream interface
```

### Hooks

```
hooks/
└── useMobileLive.ts             # React hook for Mobile Live
```

## Contexts

### Personal Context
- Any authenticated user can start a live from their profile
- The live is published under their personal account
- Visibility options: Public, Subscribers only, Private
- Subscribers receive notifications based on preferences

### Church Context
- Only authorized users can start a live on behalf of a church
- Default authorized roles: Church Admin, Super Admin
- The live is published under the church's name
- Notifications sent to: Church subscribers, members with notifications enabled, followers

## Permission System

### Authorization Flow

1. **Client-side check**: `GoLiveButton` checks permissions and only displays if authorized
2. **Server-side validation**: All API routes verify permissions before allowing actions
3. **Role-based access**: Uses existing `ChurchAdmin` and user roles

### Permission Checks

```typescript
// Check if user can start live
const permissions = await MobileLivePermissionService.canStartLive({
  userId: session.user.id,
  context: "CHURCH" | "PERSONAL",
  ownerId: string,
  ownerType: "USER" | "CHURCH",
});
```

## User Flow

### Starting a Live

1. User clicks "Diffuser en direct" button
2. System checks permissions
3. `MobileLiveSetup` modal opens with:
   - Camera preview (front/back toggle)
   - Microphone enable/disable
   - Title input
   - Description input
   - Category selection
   - Visibility selection
   - Recording toggle
4. User clicks "Démarrer le direct"
5. Session created in database
6. LiveKit token generated
7. Stream starts via LiveKit WebRTC
8. `MobileLiveInterface` displays during stream

### During a Live

- Video preview with camera controls
- Real-time viewer count
- Duration timer
- Network quality indicator
- Comments panel
- Reactions
- Stop button

### Ending a Live

1. User clicks stop button
2. Confirmation dialog
3. Stream stops
4. LiveKit room disconnected
5. Broadcast status updated to "ENDED"
6. Replay created (if recording enabled)
7. Statistics saved

## Integration with Existing Systems

### LiveKit Integration

- Uses existing LiveKit infrastructure
- Room naming: `mobile_{broadcastId}`
- WebRTC streaming
- Token-based authentication
- Reuses existing LiveKit configuration

### Database Integration

- Uses existing `LiveBroadcast` model
- Added `ownerId` field to `LiveBroadcast` for context tracking
- Reuses existing recording and replay systems

### Broadcast Output Integration

- Automatically creates native ChurchFace output
- Can be extended to support multi-stream to:
  - YouTube
  - Facebook
  - Custom RTMP destinations
  - Uses existing `BroadcastOutputService`

## Components Usage

### GoLiveButton

```tsx
import GoLiveButton from "@/components/mobilelive/GoLiveButton";

<GoLiveButton
  context="PERSONAL" | "CHURCH"
  ownerId={string}
  ownerType="USER" | "CHURCH"
  onOpenSetup={() => setShowSetup(true)}
  variant="primary" | "secondary" | "ghost"
  className="optional-class"
/>
```

### MobileLiveSetup

```tsx
import MobileLiveSetup from "@/components/mobilelive/MobileLiveSetup";

<MobileLiveSetup
  context="PERSONAL" | "CHURCH"
  ownerId={string}
  ownerType="USER" | "CHURCH"
  ownerName={string}
  onClose={() => setShowSetup(false)}
  onStart={(sessionId) => handleStart(sessionId)}
/>
```

### MobileLiveInterface

```tsx
import MobileLiveInterface from "@/components/mobilelive/MobileLiveInterface";

<MobileLiveInterface
  sessionId={string}
  session={MobileLiveSession}
  onEnd={() => handleEnd()}
/>
```

### useMobileLive Hook

```tsx
import { useMobileLive } from "@/hooks/useMobileLive";

const {
  session,
  permissions,
  isLoading,
  error,
  checkPermissions,
  createSession,
  startLive,
  stopLive,
  updateStats,
  resetSession,
} = useMobileLive();
```

## API Endpoints

### GET /api/mobilelive/permissions

Check if user can start a live in a given context.

**Query Parameters:**
- `context`: "PERSONAL" | "CHURCH"
- `ownerId`: (optional) Owner ID
- `ownerType`: (optional) "USER" | "CHURCH"

**Response:**
```json
{
  "canStartLive": true,
  "canStreamToChurch": true,
  "canRecord": true,
  "canUseChat": true,
  "canUseReactions": true,
  "canMultiStream": true,
  "reason": null
}
```

### POST /api/mobilelive/session

Create a new Mobile Live session.

**Request Body:**
```json
{
  "context": "PERSONAL" | "CHURCH",
  "ownerId": string,
  "ownerType": "USER" | "CHURCH",
  "config": {
    "title": string,
    "description": string,
    "category": string,
    "visibility": "PUBLIC" | "SUBSCRIBERS" | "PRIVATE",
    "enableRecording": boolean,
    "enableChat": boolean,
    "enableReactions": boolean
  }
}
```

**Response:**
```json
{
  "id": string,
  "userId": string,
  "context": "PERSONAL" | "CHURCH",
  "ownerId": string,
  "ownerType": "USER" | "CHURCH",
  "config": {...},
  "status": "SETUP",
  "broadcastId": string,
  "roomName": string,
  "camera": "front" | "back",
  "cameraEnabled": true,
  "microphoneEnabled": true,
  "viewerCount": 0,
  "duration": 0
}
```

### POST /api/mobilelive/session/[sessionId]/start

Start a live stream.

**Response:** Updated session object with status "LIVE"

### POST /api/mobilelive/session/[sessionId]/stop

Stop a live stream.

**Response:** Updated session object with status "ENDED"

### GET /api/mobilelive/session/[sessionId]

Get session details.

**Response:** Session object

### PATCH /api/mobilelive/session/[sessionId]

Update session statistics.

**Request Body:**
```json
{
  "viewerCount": number,
  "bitrate": number,
  "fps": number
}
```

### POST /api/mobilelive/session/[sessionId]/livekit-token

Generate LiveKit token for streaming.

**Response:**
```json
{
  "url": string,
  "token": string,
  "roomName": string
}
```

## Security Considerations

### Server-Side Validation
- All permission checks performed server-side
- User ownership verified for all operations
- Church admin status verified for church context

### Abuse Prevention
- Rate limiting on session creation (to be implemented)
- Content moderation (to be integrated)
- Reporting system (to be implemented)

### Admin Capabilities
- Force-stop capability for platform admins
- Moderation tools (to be integrated)

## Future Enhancements

### Planned Features
- [ ] Real-time chat integration with existing chat system
- [ ] Reactions integration with existing reactions system
- [ ] Push notifications for live starts
- [ ] Auto-replay creation after stream ends
- [ ] Multi-stream to external platforms (YouTube, Facebook, RTMP)
- [ ] Abuse prevention and rate limiting
- [ ] Content moderation tools
- [ ] Analytics and statistics dashboard
- [ ] Screen sharing support
- [ ] Multi-guest support
- [ ] Scheduled lives
- [ ] Live highlights/clips

### Performance Optimizations
- [ ] WebSocket for real-time viewer count
- [ ] Adaptive bitrate streaming
- [ ] Network quality optimization
- [ ] Battery usage optimization

## Testing

### Manual Testing Checklist
- [ ] Personal context live streaming
- [ ] Church context live streaming
- [ ] Permission checks (authorized/unauthorized users)
- [ ] Camera front/back toggle
- [ ] Microphone enable/disable
- [ ] Stream start/stop
- [ ] Viewer count updates
- [ ] Comments functionality
- [ ] Reactions
- [ ] Recording toggle
- [ ] Replay creation
- [ ] Mobile optimization
- [ ] One-handed use

### Automated Testing
- [ ] Unit tests for permission service
- [ ] Unit tests for mobile live service
- [ ] API endpoint tests
- [ ] Component integration tests
- [ ] E2E tests for complete flow

## Troubleshooting

### Common Issues

**Camera not accessible:**
- Check browser permissions
- Ensure HTTPS (required for camera access)
- Verify device has camera

**LiveKit connection failed:**
- Check LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET environment variables
- Verify LiveKit server is running
- Check network connectivity

**Permission denied:**
- Verify user is authenticated
- Check user role for church context
- Ensure user is church admin for church context

## Environment Variables

Required for Mobile Live:

```env
# LiveKit Configuration
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret

# Encryption (for stream keys)
ENCRYPTION_KEY=your-32-byte-secret-key
```

## Database Schema

### LiveBroadcast Model (Updated)

Added `ownerId` field to track the owner of the broadcast:

```prisma
model LiveBroadcast {
  // ... existing fields
  ownerId String?  // NEW: Owner ID for context tracking
  // ... existing fields
}
```

## Support

For issues or questions about Mobile Live, please refer to:
- Main ChurchFace documentation
- LiveKit documentation: https://docs.livekit.io
- ChurchFace development team
