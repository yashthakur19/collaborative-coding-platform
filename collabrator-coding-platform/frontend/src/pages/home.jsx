import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {

  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");

  const navigate = useNavigate();

  const createRoom = () => {
    const id = Math.random().toString(36).substring(2,8);
    navigate(`/room/${id}`, { state: { username } });
  };

  const joinRoom = () => {
    if(roomId){
      navigate(`/room/${roomId}`, { state: { username } });
    }
  };

  return (
    <div className="home-container">
      <div className="home-card glass-panel">
        <h1 className="gradient-text" style={{textAlign: "center", marginBottom: "0.5rem"}}>
          Colcode
        </h1>
        <p style={{textAlign:"center", color:"var(--text-secondary)", marginBottom:"1.5rem"}}>
          Real-time collaborative coding workspace
        </p>

        <input
          placeholder="Enter Username"
          onChange={(e)=>setUsername(e.target.value)}
        />

        <input
          placeholder="Enter Room ID"
          onChange={(e)=>setRoomId(e.target.value)}
        />

        <div style={{display: "flex", gap: "10px", marginTop: "1rem"}}>
          <button className="btn btn-success" style={{flex: 1}} onClick={createRoom}>Create Room</button>
          <button className="btn" style={{flex: 1}} onClick={joinRoom}>Join Room</button>
        </div>
      </div>
    </div>
  );
}

export default Home;