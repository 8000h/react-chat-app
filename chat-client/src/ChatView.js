import React from "react";

function ChatView(props) {
    const messages = props.history;

    console.log(props.history);

    const elements = messages.map(message =>
        <p>{`${message.from}: ${message.data}`}</p>
    );

    return <div className="chat-view">{elements}</div>;
}

export default ChatView;