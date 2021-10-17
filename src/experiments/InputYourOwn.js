import React from "react";

export default class InputYourOwn extends React.Component {
    constructor(props) {
        super(props);
        this.state = { value: '' };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({ value: event.target.value });
    }

    render() {
        return (
            <div className='row justify-content-lg-center'>
                <div className="col">
                    <div className="card p-2 gold">
                        <div className="row">
                            <form onSubmit={(event) => {
                                this.props.adjCallback(this.state.value);
                                event.preventDefault();
                            }}>
                                <div className="col">
                                    <p>Adjacency Matrix: <br />
                                        <input className="adjInsert" type="text" value={this.state.value} onChange={this.handleChange} />
                                    </p>
                                </div>
                                <div className="col submit">
                                    <input type="submit" value="Submit" className="rounded-circle" />
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="card p-2 gold">
                        <div className="row overflow-auto">
                            <div className="col">
                                <p>Visual graph maker:</p>
                                <ul>
                                    <li>Click on node: create a new edge to a new node.</li>
                                    <li>Right click on node: delete the node and its edges.</li>
                                    <li>Click on edge: create a node in the middle.</li>
                                    <li>Right click on edge: delete an edge</li>
                                    <li>To be continued...</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}