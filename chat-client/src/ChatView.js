import React from "react";

function ChatView(props) {
    const messages = props.history;

    const elements = messages.map(message =>
        <p><span className="message-sender">{message.from}:</span> {message.data}</p>
    );

    return <div id="chat-view" className="chat-view">{elements}</div>;
}

export default ChatView;