import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import socket from "../utils/socket";

function VoiceChat({ roomId, username }) {
  const [inCall, setInCall] = useState(false);
  const [peerId, setPeerId] = useState("");
  const myAudioRef = useRef();
  const peerInstance = useRef(null);
  const audioTracks = useRef({}); // userId -> HTMLAudioElement

  useEffect(() => {
    const peer = new Peer();
    
    peer.on("open", (id) => {
      setPeerId(id);
      // We don't join voice automatically, waiting for user click
    });

    peer.on("call", (call) => {
      // Incoming call: answer it automatically with our mic ONLY if we are in the call
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        call.answer(stream);
        call.on("stream", (remoteStream) => {
          playAudioStream(call.peer, remoteStream);
        });
      }).catch(err => console.error("Failed to get mic", err));
    });

    peerInstance.current = peer;

    const handleUserConnectedVoice = (remotePeerId) => {
      if (inCall && remotePeerId !== peerId) {
        connectToNewUser(remotePeerId, peerInstance.current);
      }
    };

    socket.on("user-connected-voice", handleUserConnectedVoice);

    return () => {
      peer.destroy();
      socket.off("user-connected-voice", handleUserConnectedVoice);
    };
  }, [roomId, inCall, peerId]); // Note: depending on inCall allows the callback closure to have fresh state, however in React useEffect, the closure can get stale, so we add dependencies.

  const connectToNewUser = (remotePeerId, peer) => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const call = peer.call(remotePeerId, stream);
      call.on("stream", (remoteStream) => {
        playAudioStream(remotePeerId, remoteStream);
      });
    }).catch(err => console.error("Failed to get mic", err));
  };

  const playAudioStream = (id, stream) => {
    if (!audioTracks.current[id]) {
      const audio = new Audio();
      audio.srcObject = stream;
      audio.autoplay = true;
      audioTracks.current[id] = audio;
    }
  };

  const toggleCall = () => {
    if (!inCall) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        if (myAudioRef.current) {
          myAudioRef.current.srcObject = stream;
        }
        setInCall(true);
        // notify others to call us
        socket.emit("join-voice", { roomId, peerId });
      });
    } else {
      // Stop tracks
      if (myAudioRef.current && myAudioRef.current.srcObject) {
         myAudioRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      Object.values(audioTracks.current).forEach(audio => {
         audio.srcObject?.getTracks().forEach(track => track.stop());
         audio.remove();
      });
      audioTracks.current = {};
      setInCall(false);
    }
  };

  return (
    <div className="voice-chat-widget glass-panel">
      <h4>🎙️ Voice Chat</h4>
      <p style={{marginBottom: "10px", color: "var(--text-secondary)"}}>
        Status: <span style={{fontWeight: "bold", color: inCall ? 'var(--success)' : 'var(--danger)'}}>{inCall ? 'Connected' : 'Disconnected'}</span>
      </p>
      <button className={`btn ${inCall ? 'btn-danger' : 'btn-success'}`} onClick={toggleCall} style={{width: '100%'}}>
        {inCall ? "Leave Voice" : "Join Voice"}
      </button>
      <audio ref={myAudioRef} muted autoPlay style={{display: 'none'}} />
    </div>
  );
}

export default VoiceChat;
