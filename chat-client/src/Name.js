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
            <div>
                <form className="sc-form container-70-30">
                    <input onChange={this.onChange} type="text" name="inputName" placeholder="Nickname" />
                    <button onClick={this.onClick}>Join Chatroom</button>
                </form>
            </div>
        )
    }
}

export default Name;