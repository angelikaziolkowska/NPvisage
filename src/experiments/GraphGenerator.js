import React from "react";
import { useEffect, useState } from "react";
import Checkbox from "./Checkbox";

export default class GraphGenerator extends React.Component {
    constructor(props) {
        super(props);
        this.state = { value: '', times: '' };
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeTimes = this.handleChangeTimes.bind(this);
    }

    handleChange(event) {
        this.setState({ value: event.target.value });
    }

    handleChangeTimes(event) {
        this.setState({ times: event.target.times });
    }

    render() {
        return (
            <div className='row justify-content-lg-center'>
                <div className="col">
                    <div className="card p-2 gold">
                        <div className="row">
                            <p>Tbd. Database of examples to use as start up selections. </p>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="card p-2 gold">
                        <div className="row">
                            <form onSubmit={(event) => {
                                this.props.generatorCallback(this.state.value);
                                event.preventDefault();
                            }}>
                                <div className="col">
                                    <p>Vertex Count: <br />
                                        <input type="text" value={this.state.value} onChange={this.handleChange} />
                                    </p>
                                </div>
                                <div className="col submit">
                                    <input type="submit" value="Submit" className="rounded-circle" />
                                </div>
                            </form>
                        </div>

                        <div className="row">
                            <form onSubmit={(event) => {
                                this.props.generatorCallback(this.state.value, this.state.times);
                                event.preventDefault();
                            }}>
                                <div className="col">
                                    <p>Vertex Count: <br />
                                        <input type="text" value={this.state.value} onChange={this.handleChange} /><br />
                                How many times to run algorithm? <br />
                                        <input type="text" times={this.state.times} onChange={this.handleChangeTimes} />
                                    </p>
                                </div>
                                <div className="col submit">
                                    <input type="submit" value="Submit" className="rounded-circle" />
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}