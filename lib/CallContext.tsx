"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

// Polyfill for simple-peer in Next.js
if (typeof window !== 'undefined' && !window.process) {
  window.process = { env: {} } as any;
}

import { useAuth } from './AuthContext';
import CallModal from '@/components/chat/CallModal';

interface CallContextType {
  initiateCall: (userToCall: string, callType: 'video' | 'audio') => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider = ({ children }: { children: ReactNode }) => {
  const { user, socket } = useAuth();
  
  // WebRTC States
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerName, setCallerName] = useState("");
  const [callerSignal, setCallerSignal] = useState<any>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isCaller, setIsCaller] = useState(false);
  const [currentCallType, setCurrentCallType] = useState<"video" | "audio">("video");
  const [userToCallId, setUserToCallId] = useState<string>("");

  const userVideoRef = useRef<HTMLVideoElement>(null);
  const partnerVideoRef = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<any>(null);

  useEffect(() => {
    if (!socket) return;

    const handleCallIncoming = (data: any) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerName(data.name);
      setCallerSignal(data.signal);
      setCurrentCallType(data.callType || "video");
    };

    const handleCallEnded = () => {
      setCallEnded(true);
      setReceivingCall(false);
      setIsCaller(false);
      setCallAccepted(false);
      if (connectionRef.current) {
        try { connectionRef.current.destroy(); } catch (e) {}
        connectionRef.current = null;
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setStream(null);
    };

    socket.on('call_incoming', handleCallIncoming);
    socket.on('call_ended', handleCallEnded);

    return () => {
      socket.off('call_incoming', handleCallIncoming);
      socket.off('call_ended', handleCallEnded);
    };
  }, [socket, stream]);

  const getMedia = async (video: boolean) => {
    try {
      const currentStream = await navigator.mediaDevices.getUserMedia({ video, audio: true });
      setStream(currentStream);
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = currentStream;
      }
      return currentStream;
    } catch (error: any) {
      console.error("Error accessing media devices.", error);
      
      // Fallback: If video fails (e.g. no camera), try audio only
      if (video) {
        try {
          console.log("Trying audio only fallback...");
          const audioStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
          setStream(audioStream);
          if (userVideoRef.current) {
            userVideoRef.current.srcObject = audioStream;
          }
          alert("Kamera haijapatikana, tunatumia Sauti pekee (Audio fallback).");
          return audioStream;
        } catch (audioError) {
          console.error("Audio fallback also failed", audioError);
        }
      }

      alert("Tafadhali ruhusu matumizi ya Kamera na Maikrofoni (Microphone) kwenye browser yako ili kupiga simu.");
      return null;
    }
  };

  const initiateCall = async (userToCall: string, callType: "video" | "audio") => {
    const Peer = (await import("simple-peer")).default;
    const currentStream = await getMedia(callType === "video");
    if (!currentStream) return;

    setCurrentCallType(callType);
    setIsCaller(true);
    setCallEnded(false);
    setUserToCallId(userToCall);

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: currentStream
    });

    peer.on("signal", (data: any) => {
      socket?.emit("call_user", {
        userToCall,
        signalData: data,
        from: user?.id,
        name: user?.username,
        callType
      });
    });

    peer.on("stream", (remoteStream: any) => {
      if (partnerVideoRef.current) {
        partnerVideoRef.current.srcObject = remoteStream;
      }
    });

    const handleCallAccepted = (signal: any) => {
      setCallAccepted(true);
      peer.signal(signal);
    };

    socket?.once("call_accepted", handleCallAccepted);

    connectionRef.current = peer;
  };

  const answerCall = async () => {
    setCallAccepted(true);
    const Peer = (await import("simple-peer")).default;
    const currentStream = await getMedia(currentCallType === "video");
    if (!currentStream) return;

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: currentStream
    });

    peer.on("signal", (data: any) => {
      socket?.emit("answer_call", { signal: data, to: caller });
    });

    peer.on("stream", (remoteStream: any) => {
      if (partnerVideoRef.current) {
        partnerVideoRef.current.srcObject = remoteStream;
      }
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    setIsCaller(false);
    setReceivingCall(false);
    setCallAccepted(false);
    if (connectionRef.current) {
        try { connectionRef.current.destroy(); } catch (e) {}
        connectionRef.current = null;
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);

    const userToNotify = isCaller ? userToCallId : caller;
    socket?.emit("end_call", { to: userToNotify });
  };

  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = !isMicOn;
      setIsMicOn(!isMicOn);
    }
  };

  const toggleVideo = () => {
    if (stream && currentCallType === "video") {
      stream.getVideoTracks()[0].enabled = !isVideoOn;
      setIsVideoOn(!isVideoOn);
    }
  };

  return (
    <CallContext.Provider value={{ initiateCall }}>
      {children}
      <CallModal 
        isReceivingCall={receivingCall}
        callerData={{ name: callerName }}
        callAccepted={callAccepted}
        callEnded={callEnded}
        stream={stream}
        userVideoRef={userVideoRef}
        partnerVideoRef={partnerVideoRef}
        acceptCall={answerCall}
        endCall={leaveCall}
        toggleMic={toggleMic}
        toggleVideo={toggleVideo}
        isMicOn={isMicOn}
        isVideoOn={isVideoOn}
        isCaller={isCaller}
        callType={currentCallType}
      />
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};
