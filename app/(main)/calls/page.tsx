'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Peer from 'simple-peer';
import { Phone, Video, PhoneOff } from 'lucide-react';

export default function CallsPage() {
  const { user, socket } = useAuth();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerName, setCallerName] = useState('');
  const [callerSignal, setCallerSignal] = useState<any>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState('');
  const [callEnded, setCallEnded] = useState(false);
  const [isCalling, setIsCalling] = useState(false);

  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<any>(null);

  useEffect(() => {
    // Get media permissions when the page loads
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }
      })
      .catch(err => console.log('Media access denied or not available', err));

    if (socket) {
      socket.on('call_incoming', (data: any) => {
        setReceivingCall(true);
        setCaller(data.from);
        setCallerName(data.name);
        setCallerSignal(data.signal);
      });

      socket.on('call_ended', () => {
        setCallEnded(true);
        if (connectionRef.current) connectionRef.current.destroy();
        window.location.reload(); // Quick reset for the assignment
      });
    }

    return () => {
      if (socket) {
        socket.off('call_incoming');
        socket.off('call_ended');
      }
    };
  }, [socket]);

  const callUser = (id: string) => {
    setIsCalling(true);
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream!
    });

    peer.on('signal', (data) => {
      socket?.emit('call_user', {
        userToCall: id,
        signalData: data,
        from: user?.id,
        name: user?.username,
        callType: 'video'
      });
    });

    peer.on('stream', (currentStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    socket?.on('call_accepted', (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream!
    });

    peer.on('signal', (data) => {
      socket?.emit('answer_call', { signal: data, to: caller });
    });

    peer.on('stream', (currentStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    if (connectionRef.current) connectionRef.current.destroy();
    
    // Notify the other user
    if (socket) {
      socket.emit('end_call', { to: caller || idToCall });
    }
    
    window.location.reload(); // Quick reset
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#09090b] p-6">
      <h1 className="text-2xl font-bold mb-6">Video & Voice Calls</h1>
      
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* My Video */}
        <div className="flex-1 bg-black rounded-2xl overflow-hidden aspect-video relative">
          {stream && (
            <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
          )}
          <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-md">
            Wewe ({user?.username || 'Unknown'})
          </div>
        </div>

        {/* Other User Video */}
        {callAccepted && !callEnded && (
          <div className="flex-1 bg-black rounded-2xl overflow-hidden aspect-video relative">
            <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-md">
              {callerName || 'Mtu Mwingine'}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-6">
        {/* Calling Controls */}
        <div className="flex items-center gap-4 w-full max-w-md">
          <input
            type="text"
            value={idToCall}
            onChange={(e) => setIdToCall(e.target.value)}
            placeholder="Weka ID ya mtumiaji kumpigia..."
            className="flex-1 p-3 rounded-xl border bg-background"
          />
          <button 
            onClick={() => callUser(idToCall)}
            className="bg-primary text-white p-3 rounded-xl hover:bg-primary/90"
          >
            <Video className="w-5 h-5" />
          </button>
        </div>

        {/* Incoming Call Notification */}
        {receivingCall && !callAccepted && (
          <div className="bg-primary/10 border border-primary p-6 rounded-2xl flex flex-col items-center gap-4 w-full max-w-md">
            <h3 className="text-lg font-semibold">{callerName} anapiga simu...</h3>
            <button 
              onClick={answerCall}
              className="bg-green-500 text-white px-6 py-2 rounded-full font-medium hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <Phone className="w-4 h-4" /> Pokea Simu
            </button>
          </div>
        )}

        {/* End Call Button */}
        {callAccepted && !callEnded && (
          <button 
            onClick={leaveCall}
            className="bg-red-500 text-white px-8 py-3 rounded-full font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
          >
            <PhoneOff className="w-5 h-5" /> Kata Simu
          </button>
        )}
      </div>
    </div>
  );
}
