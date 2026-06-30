"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

interface CallModalProps {
  isReceivingCall: boolean;
  callerData: any;
  callAccepted: boolean;
  callEnded: boolean;
  stream: MediaStream | null;
  userVideoRef: React.RefObject<HTMLVideoElement>;
  partnerVideoRef: React.RefObject<HTMLVideoElement>;
  acceptCall: () => void;
  endCall: () => void;
  toggleMic: () => void;
  toggleVideo: () => void;
  isMicOn: boolean;
  isVideoOn: boolean;
  isCaller: boolean;
  callType: 'audio' | 'video';
}

export default function CallModal({
  isReceivingCall,
  callerData,
  callAccepted,
  callEnded,
  stream,
  userVideoRef,
  partnerVideoRef,
  acceptCall,
  endCall,
  toggleMic,
  toggleVideo,
  isMicOn,
  isVideoOn,
  isCaller,
  callType
}: CallModalProps) {
  
  // Attach stream to the local video element once it renders
  useEffect(() => {
    if (userVideoRef.current && stream) {
      userVideoRef.current.srcObject = stream;
    }
  }, [stream]);

  // If we are neither calling nor receiving, don't show the modal
  if (!isReceivingCall && !isCaller && !callAccepted) return null;
  if (callEnded) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center backdrop-blur-sm">
      
      {/* Header Info */}
      <div className="absolute top-10 text-center text-white z-10">
        <h2 className="text-2xl font-semibold mb-2">
          {callerData?.name || "Calling..."}
        </h2>
        <p className="text-sm opacity-70">
          {!callAccepted && isReceivingCall ? "Incoming Call" : ""}
          {!callAccepted && isCaller ? "Ringing..." : ""}
          {callAccepted ? "Ongoing Call" : ""}
        </p>
      </div>

      {/* Videos Container */}
      <div className="relative w-full max-w-4xl h-[70vh] flex items-center justify-center p-4">
        
        {/* Partner Video/Audio (Main) */}
        {callAccepted && (
          <video 
            playsInline 
            ref={partnerVideoRef} 
            autoPlay 
            className={`w-full h-full object-cover rounded-2xl bg-gray-900 shadow-2xl border border-gray-800 ${callType === 'audio' ? 'hidden' : ''}`}
          />
        )}

        {/* User Video/Audio (Local Camera) */}
        {stream && (
          <video 
            playsInline 
            muted 
            ref={userVideoRef} 
            autoPlay 
            className={`absolute bottom-8 right-8 object-cover rounded-xl shadow-lg border-2 border-green-500 bg-gray-800 transition-all z-20 ${callType === 'audio' ? 'hidden' : 'w-32 h-48'}`}
          />
        )}

        {/* Profile Picture of the Caller/Receiver before accepted */}
        {!callAccepted && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
             <img 
               src={callerData?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(callerData?.name || "User")}&background=10b981&color=fff`} 
               className="w-32 h-32 rounded-full object-cover border-4 border-green-500 shadow-2xl animate-pulse"
               alt={callerData?.name}
             />
          </div>
        )}

        {/* Audio Call UI Placeholder */}
        {callType === 'audio' && (
          <div className="flex flex-col items-center justify-center">
             <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mb-6 shadow-xl border-4 border-green-500">
                <Phone className="w-16 h-16 text-white" />
             </div>
             {callAccepted && <p className="text-white text-lg">In progress...</p>}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-12 flex items-center gap-6 z-10">
        {/* Incoming call buttons */}
        {isReceivingCall && !callAccepted && (
          <button 
            onClick={acceptCall}
            className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105"
          >
            {callType === 'video' ? <Video className="w-8 h-8" /> : <Phone className="w-8 h-8" />}
          </button>
        )}

        {/* Action Controls (Only show if we accepted or if we are the caller) */}
        {(callAccepted || isCaller) && (
          <>
            <button 
              onClick={toggleMic}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isMicOn ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white text-black'}`}
            >
              {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>
            
            <button 
              onClick={endCall}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105"
            >
              <PhoneOff className="w-8 h-8" />
            </button>

            {callType === 'video' && (
              <button 
                onClick={toggleVideo}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isVideoOn ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white text-black'}`}
              >
                {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
