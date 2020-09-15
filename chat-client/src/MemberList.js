import React from "react";

function MemberList(props) {

    let members = props.members.map(member => {
        return <p>{member}</p>
    });

    return <div><h1>Members</h1><hr />{members}</div>
}

export default MemberList;