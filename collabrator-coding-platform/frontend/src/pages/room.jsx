import { useParams, useLocation } from "react-router-dom";
import CodeEditor from "../components/CodeEditor";
import socket from "../utils/socket";
import { useEffect } from "react";
import {useState} from "react";
import UserList from "../components/UserList";
import Chat from "../components/chat";
import VoiceChat from "../components/VoiceChat";

function Room(){

  const { roomId } = useParams();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const username = location.state?.username;
  
  useEffect(() => {
    socket.emit("join-room", { roomId,
      username
     });
  }, [roomId]);
  useEffect(() => {

  socket.on("user-list", (users) => {
    setUsers(users);
  });

  return () => {
    socket.off("user-list");
  };

}, []);
  return (
   <div className="room-layout">

    {/* LEFT - USERS & VOICE */}
    <div className="sidebar-panel">
      <UserList users={users} />
      <VoiceChat roomId={roomId} username={username} />
    </div>

    {/* CENTER - EDITOR + OUTPUT */}
    <div className="editor-container">
      <div className="toolbar glass-panel" style={{padding: "10px 1.5rem"}}>
        <h2 style={{margin: 0}} className="gradient-text">Room: {roomId}</h2>
      </div>
      <CodeEditor roomId={roomId} />
    </div>

    {/* RIGHT - CHAT */}
    <div className="sidebar-panel">
      <Chat roomId={roomId} username={username} />
    </div>

  </div>
  );
}

export default Room;