import React from "react";

function MemberList(props) {

    let members = props.members.map(member => {
        return <p>{member}</p>
    });

    return <div className="member-list"><h3>Users</h3>{members}</div>
}

export default MemberList;