/**
 * Media Diagnostic Tool
 * 
 * This utility provides direct testing of getUserMedia without WebRTC
 * to isolate camera/microphone issues from the call system.
 */

export interface DiagnosticResult {
  success: boolean;
  error?: Error;
  stream?: MediaStream;
  videoTrackCount: number;
  audioTrackCount: number;
  deviceId?: string;
}

export async function testAudioOnly(): Promise<DiagnosticResult> {
  console.log("[DIAGNOSTIC] Testing audio-only getUserMedia");
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false
    });
    
    const videoTrackCount = stream.getVideoTracks().length;
    const audioTrackCount = stream.getAudioTracks().length;
    
    console.log("[DIAGNOSTIC] Audio-only test SUCCESS", {
      videoTrackCount,
      audioTrackCount
    });
    
    // Stop the stream immediately after test
    stream.getTracks().forEach(track => track.stop());
    
    return {
      success: true,
      stream,
      videoTrackCount,
      audioTrackCount
    };
  } catch (error) {
    console.error("[DIAGNOSTIC] Audio-only test FAILED", error);
    return {
      success: false,
      error: error as Error,
      videoTrackCount: 0,
      audioTrackCount: 0
    };
  }
}

export async function testVideoOnly(): Promise<DiagnosticResult> {
  console.log("[DIAGNOSTIC] Testing video-only getUserMedia");
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true
    });
    
    const videoTrackCount = stream.getVideoTracks().length;
    const audioTrackCount = stream.getAudioTracks().length;
    
    const videoTrack = stream.getVideoTracks()[0];
    const deviceId = videoTrack?.getSettings()?.deviceId as string | undefined;
    
    console.log("[DIAGNOSTIC] Video-only test SUCCESS", {
      videoTrackCount,
      audioTrackCount,
      deviceId
    });
    
    // Stop the stream immediately after test
    stream.getTracks().forEach(track => track.stop());
    
    return {
      success: true,
      stream,
      videoTrackCount,
      audioTrackCount,
      deviceId
    };
  } catch (error) {
    console.error("[DIAGNOSTIC] Video-only test FAILED", error);
    return {
      success: false,
      error: error as Error,
      videoTrackCount: 0,
      audioTrackCount: 0
    };
  }
}

export async function testAudioVideo(): Promise<DiagnosticResult> {
  console.log("[DIAGNOSTIC] Testing audio+video getUserMedia");
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    });
    
    const videoTrackCount = stream.getVideoTracks().length;
    const audioTrackCount = stream.getAudioTracks().length;
    
    const videoTrack = stream.getVideoTracks()[0];
    const deviceId = videoTrack?.getSettings()?.deviceId as string | undefined;
    
    console.log("[DIAGNOSTIC] Audio+video test SUCCESS", {
      videoTrackCount,
      audioTrackCount,
      deviceId
    });
    
    // Stop the stream immediately after test
    stream.getTracks().forEach(track => track.stop());
    
    return {
      success: true,
      stream,
      videoTrackCount,
      audioTrackCount,
      deviceId
    };
  } catch (error) {
    console.error("[DIAGNOSTIC] Audio+video test FAILED", error);
    return {
      success: false,
      error: error as Error,
      videoTrackCount: 0,
      audioTrackCount: 0
    };
  }
}

export async function enumerateDevices(): Promise<{
  videoInputs: number;
  audioInputs: number;
  audioOutputs: number;
  devices: MediaDeviceInfo[];
}> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = devices.filter(d => d.kind === 'videoinput').length;
    const audioInputs = devices.filter(d => d.kind === 'audioinput').length;
    const audioOutputs = devices.filter(d => d.kind === 'audiooutput').length;
    
    console.log("[DIAGNOSTIC] Device enumeration", {
      videoInputs,
      audioInputs,
      audioOutputs,
      total: devices.length
    });
    
    return {
      videoInputs,
      audioInputs,
      audioOutputs,
      devices
    };
  } catch (error) {
    console.error("[DIAGNOSTIC] Device enumeration FAILED", error);
    return {
      videoInputs: 0,
      audioInputs: 0,
      audioOutputs: 0,
      devices: []
    };
  }
}

export async function runFullDiagnostic(): Promise<{
  devices: Awaited<ReturnType<typeof enumerateDevices>>;
  audioOnly: Awaited<ReturnType<typeof testAudioOnly>>;
  videoOnly: Awaited<ReturnType<typeof testVideoOnly>>;
  audioVideo: Awaited<ReturnType<typeof testAudioVideo>>;
}> {
  console.log("[DIAGNOSTIC] Starting full media diagnostic");
  
  const devices = await enumerateDevices();
  const audioOnly = await testAudioOnly();
  const videoOnly = await testVideoOnly();
  const audioVideo = await testAudioVideo();
  
  console.log("[DIAGNOSTIC] Full diagnostic complete", {
    devices,
    audioOnly,
    videoOnly,
    audioVideo
  });
  
  return {
    devices,
    audioOnly,
    videoOnly,
    audioVideo
  };
}
