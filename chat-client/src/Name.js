import React from "react";

class Name extends React.Component {

    state = {
        inputName: ""
    }

    constructor() {
        super();
    }

    onChange = (event) => {
        const {name, value} = event.target;
        this.setState({
            [name]: value
        });
    }

    onClick = (event) => {
        event.preventDefault();

        this.props.app.sendMessage({
            type: "setname",
            nickname: this.state.inputName
        })
    }

    render() {
        return (
            <div className="center" style={{width: "50%"}}>
                <form className="sc-form">
                    <h3>Enter a username</h3>
                    <div className="container-halfs">
                        <input onChange={this.onChange} type="text" name="inputName" placeholder="Nickname" />
                        <button onClick={this.onClick}>Join Chatroom</button>
                    </div>
                </form>
            </div>
        )
    }
}

export default Name;