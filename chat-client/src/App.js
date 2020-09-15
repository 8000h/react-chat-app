import React from "react";

import Name from "./Name";
import ChatInput from "./ChatInput";
import ChatView from "./ChatView";
import MemberList from "./MemberList";

const URL = "ws://10.0.0.111:8080";

const PROTO_CONNECTING = 0;
const PROTO_SETNAME = 1;
const PROTO_SESSION = 2;
const PROTO_TERMINATED = 3;

function Error(props) {
    let status = props.status;

    if (status != null && !status.success)
        return <h1 style={{color: "RED"}}>{status.info}</h1>;

    return "";
}

class App extends React.Component {

    connection = null;

    state = {
        protocolState: PROTO_CONNECTING,
        history: [],
        members: [],
        nickname: "",
        status: null
    }

    constructor() {
        super();
    }

    onOpen = (event) => {
        this.setState({
            protocolState: PROTO_SETNAME
        })
    }

    onMessage = (event) => {
        let message = JSON.parse(event.data);

        switch (this.state.protocolState) {
            case PROTO_SETNAME:
                this.proto_setname(message);
                break;

            case PROTO_SESSION:
                this.dispatchMessage(message);
                break;
        }
    }

    onClose = (event) => {
        this.setState({
            protocolState: PROTO_TERMINATED
        });
    }

    proto_setname = (message) => {
        if (message.type === "status") {
            if (message.success) {
                this.setState({
                    protocolState: PROTO_SESSION,
                    nickname: message.info
                });
            } else {
                this.setState({
                    status: message
                });
            }
        }
    }

    sendMessage = (message) => {
        this.connection.send(JSON.stringify(message));
    }

    proto_chat = (message) => {
        this.setState(prevState => this.state.history.push(message))
        console.log(this.state.history);
    }

    proto_userupdate = (message) => {
        let nickname = message.user;
        switch (message.action) {
            case "join":
                this.setState(prevState => this.state.members.push(nickname));
                break;

            case "leave":
                this.setState(prevState => {
                    this.state.members.splice(this.state.members.indexOf(nickname));
                });
                break;
        }
    }

    proto_toggletype = (message) => {
        
    }

    proto_unknown = (message) => {

    }

    dispatchMessage = (message) => {
        switch (message.type) {
            case "chat":
                this.proto_chat(message);
                break;
            
            case "toggletype":
                this.proto_toggletype(message);
                break;

            case "userupdate":
                this.proto_userupdate(message);
                break;

            default:
                this.proto_unknown(message);
                break;
        }
    }

    componentDidMount() {
        this.connection = new WebSocket(URL);

        this.connection.onopen = this.onOpen;
        this.connection.onmessage = this.onMessage;
        this.connection.onclose = this.onClose;
    }

    render() {
        switch (this.state.protocolState) {
            case PROTO_CONNECTING:
                return <h2>Connecting, please wait</h2>;

            case PROTO_SETNAME:
                return (
                    <div style={{width: "75%"}} className="center">
                        <Name app={this} />
                    </div>
                );

            case PROTO_SESSION:
                return (
                    <div className="container-halfs">
                        <ChatView history={this.state.history} />
                        <MemberList members={this.state.members} />
                        <ChatInput app={this} />
                    </div>
                );

            case PROTO_TERMINATED:
                return <h2>Could not connect to server</h2>
        }
    }
}

export default App;