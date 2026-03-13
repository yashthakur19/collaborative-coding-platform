import { useParams, useLocation } from "react-router-dom";

function Room(){

  const { roomId } = useParams();
  const location = useLocation();

  const username = location.state?.username;

  return (
    <div style={{textAlign:"center", marginTop:"50px"}}>

      <h1>Room ID: {roomId}</h1>

      <h2>User: {username}</h2>

      <p>Code editor will appear here soon...</p>

    </div>
  );
}

export default Room;