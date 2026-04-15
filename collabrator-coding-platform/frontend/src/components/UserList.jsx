function UserList({users}){
    return (
        <div className="glass-panel" style={{flex: 1, overflowY: "auto"}}>
            <h4>👥 Participants ({users.length})</h4>
           
            {users.map((user,index)=>(
                <div key={index} className="user-item">
                    <div className="user-avatar">{user.username ? user.username.charAt(0) : '?'}</div>
                    <span style={{fontWeight: 600}}>{user.username || "Anonymous"}</span>
                </div>
            ))}
        </div>
    );
}
export default UserList;