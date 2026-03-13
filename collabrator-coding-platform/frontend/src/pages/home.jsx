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
    <div style={{textAlign:"center", marginTop:"100px"}}>

      <h1>Collaborative Coding Platform</h1>

      <input
        placeholder="Enter Username"
        onChange={(e)=>setUsername(e.target.value)}
      />

      <br/><br/>

      <input
        placeholder="Enter Room ID"
        onChange={(e)=>setRoomId(e.target.value)}
      />

      <br/><br/>

      <button onClick={createRoom}>Create Room</button>

      <button onClick={joinRoom}>Join Room</button>

    </div>
  );
}

export default Home;