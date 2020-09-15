import React from "react";

class ChatInput extends React.Component {

    state = {
        inputMessage: ""
    }

    constructor() {
        super();
    }

    onChange = (event) => {
        const {name, value} = event.target;
        this.setState({
            [name]: value
        })
    }

    onSubmit = (event) => {
        event.preventDefault();

        this.props.app.sendMessage({
            type: "chat",
            data: this.state.inputMessage
        });

        this.setState({
            inputMessage: ""
        });
    }

    render() {
        return (
            <div>
                <input onSubmut={this.onSubmit} name="inputMessage" type="text" value={this.state.inputMessage} onChange={this.onChange} />
                <button onClick={this.onSubmit}>Send Message</button>
            </div>
        )
    }
}

export default ChatInput;