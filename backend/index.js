const express = require("express");
const ws = require("ws");

const http_port = 3000;
const ws_port = 8080;
const app = express();

let clients = []

const socketServer = new ws.Server({port: ws_port});

const PROTO_SETNAME = 0;
const PROTO_SESSION = 1;

const isValidNickname = (nickname) => {
    for (var client of clients)
        if (client.nickname === nickname)
            return false;

    return true;
}

const createChatObject = (senderName, chatString) => {
    return {
        type: "chat",
        from: senderName,
        data: chatString,
    };
}

const createTypingObject = (senderName, isTyping) => {
    return {
        type: "toggletype",
        from: senderName,
        isTyping: isTyping
    };
}

const createErrorObject = (info) => {
    return {
        type: "error",
        info: info
    };
}

const createUserUpdateObject = (user, action) => {
    return {
        type: "userupdate",
        user: user,
        action: action
    }
}

const sendUsers = async (client) => {
    for (var user of clients)
        if (user !== client)
            client.sendMessage(createUserUpdateObject(user.nickname, "join"));
}

const forwardMessage = async (message) => {
    clients.forEach(async (client) => {
        client.sendMessage(message);
    })
}

const serverBroadcast = async (chatMessage) => {
    let message = createChatObject("SERVER", chatMessage);
    forwardMessage(message);
}

const proto_setname = (sender, message) => {
    if (sender.protocolState === PROTO_SESSION || message.type !== "setname")
        return;

    if (isValidNickname(message.nickname)) {
        sender.nickname = message.nickname;
        sender.protocolState = PROTO_SESSION;

        sender.sendMessage({
            type: "status",
            success: true,
            info: message.nickname
        });

        console.log(`A client registered as ${sender.nickname}`);
        serverBroadcast(`${sender.nickname} has joined`);

        let userJoinObject = createUserUpdateObject(sender.nickname, "join");
        forwardMessage(userJoinObject);

        sendUsers(sender);

    } else {
         sender.sendMessage({
             type: "status",
             success: false,
             info: "Choose another nickname"
         })
    }
}

const proto_chat = (sender, message) => {
    let chatObject = createChatObject(sender.nickname, message.data);
    forwardMessage(chatObject);
}

const proto_toggletype = (sender, message) => {
    let typeObject = createTypingObject(sender.nickname, message.isTyping);
    forwardMessage(typeObject);
}

const proto_unknown = (sender, message) => {
    let errorObject = createErrorObject("That message type is unknown")
    sender.sendMessage(errorObject);
}

const dispatchMessage = (sender, message) => {
    switch (message.type) {
        case "chat":
            proto_chat(sender, message);
            break;
        
        case "toggletype":
            proto_toggletype(sender, message);
            break;

        default:
            proto_unknown(sender, message);
            break;
    }
}

class Client {

    constructor(socket) {
        this.socket = socket;
        this.protocolState = PROTO_SETNAME;
        this.nickname = null;

        socket.on("close", this.onClose);
        socket.on("message", this.onMessage);
    }

    sendMessage = (message) => {
        if (this.socket.readyState == ws.OPEN)
            this.socket.send(JSON.stringify(message));
    }

    onClose = (socket) => {
        if (this.nickname) {
            console.log(this.nickname + " disconnected");
            serverBroadcast(`${this.nickname} has left`);

            let onLeaveObject = createUserUpdateObject(this.nickname, "leave");
            forwardMessage(onLeaveObject);
        }

        else
            console.log("A user failed to set their name and disconnected");

        clients.splice(clients.indexOf(this), 1);
    }

    onMessage = (message) => {
        message = JSON.parse(message);
        switch (this.protocolState) {
            case PROTO_SETNAME:
                proto_setname(this, message);
                break;

            case PROTO_SESSION:
                dispatchMessage(this, message);
                break;
        }
    }
}

socketServer.on("connection", async (socket) => {
    let newClient = new Client(socket);
    clients.push(newClient);

    console.log("A new client connected");
});