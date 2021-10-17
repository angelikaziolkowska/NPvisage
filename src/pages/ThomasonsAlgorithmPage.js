import React from "react";
import { Link, Route } from "react-router-dom";
import ExperimentDesc from '../experiments/ExperimentDesc'
import InputYourOwn from '../experiments/InputYourOwn'
import GraphGenerator from '../experiments/GraphGenerator'
import BarChart from "../stats/BarChart";
import { Graph } from "react-d3-graph";

class HamiltonianCycle {
    constructor() {
        this.V = 0;
        this.path = [];
    }

    isSafe(v, graph, path, pos) {
        if (!graph[path[pos - 1]][v]) return false;
        for (var i = 0; i < pos; i++) if (path[i] == v) return false;
        return true;
    }

    hamCycleUtil(graph, path, pos) {
        if (pos == this.V) {
            if (graph[path[pos - 1]][path[0]]) return true;
            else return false;
        }

        for (var v = 1; v < this.V; v++) {
            if (this.isSafe(v, graph, path, pos)) {
                path[pos] = v;
                if (this.hamCycleUtil(graph, path, pos + 1)) return true;
                path[pos] = -1;
            }
        }
        return false;
    }

    hamCycle(graph) {
        this.path = new Array(this.V).fill(0);
        for (var i = 0; i < this.V; i++) this.path[i] = -1;
        this.path[0] = 0;
        if (!this.hamCycleUtil(graph, this.path, 1)) {
            document.write("<br>Solution does not exist");
            return 0;
        }
        return this.path;
    }
}

let Data = {
    nodes: [{ id: "0" },
    ],
    links: [
    ],
}

function zeros(dimensions) {
    var array = [];
    for (var i = 0; i < dimensions[0]; ++i) {
        array.push(dimensions.length == 1 ? 0 : zeros(dimensions.slice(1)));
    }
    return array;
}

function zeros2D(vertexCount) {
    let row = zeros(vertexCount);
    let adjMat = [];
    for (let i = 0; i < vertexCount; i++) {
        adjMat.push(row);
    }
    return adjMat;
}

function addFirstCircularCycleToAdjMat(adjMat) {
    let i = 0;
    adjMat.forEach(row => {
        row[i + 1] = 1
        i++;
    })
    console.log("circular", adjMat);
    return adjMat;
}

function dataToAdjMat(data) {
    let len = data.nodes.length;
    let AdjMat = zeros([len, len]);
    console.log(data);
    console.log(AdjMat);
    console.log(AdjMat[1][2]);
    console.log(data.links[0]["target"])
    for (var i = 0; i < data.links.length; i++) {
        console.log(AdjMat[1][1]);
        AdjMat[(data.links[i]["source"])][(data.links[i]["target"])] = "1";
        AdjMat[(data.links[i]["target"])][(data.links[i]["source"])] = "1";
    }
    console.log(AdjMat)
    return AdjMat;
}

let emptyGraphData = {
    nodes: [],
    links: [],
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Visualization extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: Data,
            slowDown: true,
            initSpeed: 100,
            speed: 100,
            stats: [],
            experi: 0,
            expStats: [],
        };
        this.onClickNode = this.onClickNode.bind(this);
        this.onClickLink = this.onClickLink.bind(this);
        this.onRightClickNode = this.onRightClickNode.bind(this);
        this.onRightClickLink = this.onRightClickNode.bind(this);
        this.runOnEachEdge = this.runOnEachEdge.bind(this);
        this.initialGraph = this.initialGraph.bind(this);
        this.updateCycleOrderAndReturnEdges = this.updateCycleOrderAndReturnEdges.bind(this);
        this.ThomasonsLollipop = this.ThomasonsLollipop.bind(this);
        this.colorEdge = this.colorEdge.bind(this);
        this.black = this.black.bind(this);

        this.handleCallback = (childData) => {
            this.setState({ data: childData });
            console.log("bla", childData);
        };

        this.handleAdjCallback = (adjData) => {
            let adjMat = JSON.parse(adjData);
            let d = this.turnAdjMatIntoData(adjMat);
            this.setState({ data: d });
            console.log("input matrix", adjMat);
        };

        this.handleGeneratorCallback = (vertexCount, times) => {
            let g = this.generateCubicGraph(vertexCount);
            let gFound = g !== null
            while (!gFound) {
                // try again
                g = this.generateCubicGraph(vertexCount);
                gFound = g !== null
            }
            if (gFound) {
                this.setState({ data: g });
                console.log("input matrix", g);

                console.log("times", times)
                if (parseInt(times) >= 1) {
                    this.runOnEachEdge();
                }
            }
        }
    }

    async runOnEachEdge() {
        let data = { ...this.state.data };
        let stats = { ...this.state.stats };
        let experi = this.state.experi;
        experi = experi + 1;
        this.setState({ experi: experi });

        // turn graph data to adj matrix
        console.log("data", data)
        var graph1 = dataToAdjMat(data)

        // get the first Hamiltonian cycle
        var hamiltonian = new HamiltonianCycle();
        hamiltonian.V = data.nodes.length;
        var cycle1 = hamiltonian.hamCycle(graph1);

        console.log(graph1);
        console.log(cycle1);

        // run on all edges 
        let edge = [];
        let g = {}
        for (let i = 0; i < cycle1.length; i++) {
            // Set all links to be lightgray to start with
            g = this.initialGraph();
            let slowDown = { ...this.state.slowDown };
            let speed = { ...this.state.speed };
            if (slowDown > 0) await sleep(speed / 3);

            // per each edge
            if (i < cycle1.length - 1) {
                edge = [cycle1[i], cycle1[i + 1]];
            }
            else {
                edge = [cycle1[cycle1.length - 1], cycle1[0]];
            }
            console.log("edge", edge);

            // reorder path to start with the edge
            // STEP 1 of Thomason's Algorithm
            let C = this.updateCycleOrderAndReturnEdges(cycle1, edge);
            console.log("newC", C)

            // update graph by coloring P black
            this.black(C);
            if (slowDown) await sleep(speed);

            // run Lollipop Algorithm
            let results = this.ThomasonsLollipop(C);

            console.log("newCycle", results.newCycle);
            console.log("iterations", results.ite);

            let stat = [[experi, edge, C, results.newCycle, results.ite, g]];
            this.setState({ stats: [...this.state.stats, ...stat] });

        }

        let exp = this.state.stats.filter(item => {
            return item[0] == experi
        })
        console.log("exp", exp); // exp has all results for this experiment
        // now calculate min iterations, max iterations and average iterations of this experiment then save it to state.expStats
        let minIte = 999999999;
        let maxIte = 0;
        let addedIte = 0
        for (let i = 0; i < exp.length; i++) {
            minIte = exp[i][4] < minIte ? exp[i][4] : minIte;
            maxIte = exp[i][4] > maxIte ? exp[i][4] : maxIte;
            addedIte += exp[i][4];
        }
        let expStat = [experi, minIte, maxIte, addedIte / exp.length, g,]
        this.setState({ expStats: [...this.state.expStats, ...expStat] });
        console.log("exp NEW", expStat);

        let modSpeed = this.state.initSpeed;
        this.setState({ speed: modSpeed });
        console.log("STATS", this.state.stats);
        return (
            <btn className="btn" onClick={(event) => {
                this.props.statsCallback(this.state.stats);
                event.preventDefault();
            }} />
        )
    }

    initialGraph() {
        let modData = { ...this.state.data };
        modData.links.forEach(item => {
            item.color = "lightgray"
        });
        this.setState({ data: modData });

        return modData;
    }

    updateCycleOrderAndReturnEdges(C, e) {
        //swap round list items so starts from the vertex we want
        let idx = C.indexOf(e[0]);
        let newC = C.slice(idx).concat(C.slice(0, idx));
        console.log('newC', newC)

        let pathEdges = []
        //update vertices into edges
        for (let i = 0; i < newC.length - 1; i++) {
            pathEdges.push([newC[i], newC[i + 1]]);
        }
        pathEdges.push([newC[newC.length - 1], newC[0]])
        console.log('first cycle', pathEdges)
        return pathEdges
    }

    // Function which goes through the Lollipop iterations in a loop, updating P on each iteration
    ThomasonsLollipop(C) {
        let g = this.state.data;
        let ite = 0;
        let P = C;

        // each Step of Lollipop
        while (true) {
            ite += 1;
            console.log("ite", ite);

            // get red from g ---------------------------- red is important so we dont select it as blue
            let red = g.links.find(link => {
                return ((parseInt(link.source) === P[P.length - 1][0] && parseInt(link.target) === P[P.length - 1][1]) ||
                    (parseInt(link.source) === P[P.length - 1][1] && parseInt(link.target) === P[P.length - 1][0]))
            });
            // color last edge of cycle red 
            this.colorEdge([parseInt(red.source), parseInt(red.target)], "red");
            console.log("red", [parseInt(red.source), parseInt(red.target)]);

            // remove red from P
            P = P.slice(0, P.length - 1);

            // get new last edge of P -------------------- last edge is important so we dont select it as blue
            let lastEdge = g.links.find(link => {
                return ((parseInt(link.source) === P[P.length - 1][0] && parseInt(link.target) === P[P.length - 1][1]) ||
                    (parseInt(link.source) === P[P.length - 1][1] && parseInt(link.target) === P[P.length - 1][0]))
            });

            // get last vertex of P ---------------------- we know we have to select blue going from lastV now
            let lastV = P[P.length - 1][1];

            // get edge from lastV but not "red" and not "lastEdge" then color it blue
            let blue = g.links.find(link => {
                return ((parseInt(link.source) === lastV && link !== lastEdge && link !== red) ||
                    (parseInt(link.target) === lastV && link !== lastEdge && link !== red))
            })

            let blueEdge = null
            if (parseInt(blue.source) === lastV) {
                blueEdge = [parseInt(blue.target), parseInt(blue.source)]
            }
            else if (parseInt(blue.target) === lastV) {
                blueEdge = [parseInt(blue.source), parseInt(blue.target)];
            }

            // color blue
            this.colorEdge(blueEdge, "blue");
            console.log("blue", blueEdge);

            // reorder P
            let newP = []

            // add first edges from path until blue edge is reached
            let i = 0
            for (i; i < P.length; i++) {
                if (P[i][0] !== blueEdge[0]) {
                    // add to newP
                    newP.push(P[i]);
                }
                else {
                    break;
                }
            }

            // add blue to newP
            newP.push(blueEdge);

            let flipped = P.slice(i, P.length).reverse();

            // now add the flipped
            flipped.forEach(item => {
                newP.push([item[1], item[0]]);
            });

            P = newP;
            console.log("P after iteration", P);

            // if there is an edge between P[P.length-1][0] && P[0][0] then we connect those and the algorithm is finished.
            let done = g.links.find(link => {
                return ((parseInt(link.source) === P[P.length - 1][0] && parseInt(link.target) === P[0][0]) ||
                    (parseInt(link.target) === P[P.length - 1][0] && parseInt(link.source) === P[0][0]))
            });

            // then replace last vert of P to connect to the first initial given edge
            if (done) {
                P[P.length - 1][1] = P[0][0];
                // and color this edge blue for finalized visualization
                this.colorEdge([parseInt(done.source), parseInt(done.target)], "blue");

                return { ite: ite, newCycle: P.map(function (value, index) { return value[0]; }) };
            }
        }
    }

    colorEdge(edge, color) {
        let modData = { ...this.state.data };
        let l = modData.links.find(item => {
            return item.source == edge[0] && item.target == edge[1] ||
                item.source == edge[1] && item.target == edge[0]
        });
        if (l) l.color = color;
        this.setState({ data: modData });
    }

    black(newC) {
        let modData = { ...this.state.data };
        for (let i = 0; i < newC.length; i++) {
            let link = modData.links.find(item => {
                return item.source == newC[i][0] && item.target == newC[i][1] ||
                    item.source == newC[i][1] && item.target == newC[i][0]
            });
            link.color = "black";
            this.setState({ data: modData });
        }
    }

    generateCubicGraph(vertexCount) {
        let d = {
            nodes: [],
            links: [],
        }
        console.log("graph start", d);
        let vertices = Array.from({ length: vertexCount }, (_, i) => i)
        console.log("1", vertices);

        vertices = vertices.sort(() => Math.random() - 0.5);
        let available = vertices;

        console.log("2", available);
        for (let i = 0; i < vertexCount; i++) {
            // vertexes
            d.nodes.push({ id: i.toString() });

            // first cycle
            if (i < vertexCount - 1) {
                d.links.push({ source: i.toString(), target: (i + 1).toString(), color: "lightgray" })
            }
            else {
                d.links.push({ source: i.toString(), target: "0", color: "lightgray" })
            }
            // each vertex needs 1 more edge randomly added or in pattern(tbd)
            // ----randomly
            console.log("i", i);

            // if i has not been added as third edge yet
            if (typeof (available.find(item => item === i)) == "number") {
                // first remove i from available as we are adding third edge to i
                available = available.filter(a => {
                    return a !== i
                })
                console.log("after removing i", available);
                // then add the vertice it goes to while removing it from available 
                let newEdge = null;
                available.filter(a => {
                    // i is 0
                    if (i === 0 && a !== i + 1 && a !== vertexCount - 1) {
                        newEdge = a
                        console.log("a")
                    }
                    // i is last vertex
                    else if (i === vertexCount - 1 && a !== i - 1 && a !== 0) {
                        newEdge = a
                        console.log("b")
                    }
                    // i is anywhere from 1 to one before last vertex
                    else if (i !== 0 && i !== vertexCount - 1 && a !== i + 1 && a !== i - 1) {
                        newEdge = a
                        console.log("c")
                    }
                    return a === newEdge
                })
                // remove newedge from available
                available = available.filter(a => {
                    return a != newEdge
                })
                // add third edge
                if (newEdge) {
                    d.links.push({ source: i.toString(), target: newEdge.toString(), color: "lightgray" })
                }
                else { // newedge is null because the only option left in available is adjacent.
                    console.log("new edge is null because adj is left only")
                    // rerun algorithm from start
                    return null;
                    //return this.generateCubicGraph(vertexCount);
                }
                console.log("i is now connected to", newEdge);
                console.log("after removing i's new connection", available);
            }
        }
        console.log("graph end", d);
        return d;
    }

    generateRandomCubicAdjMat(vertexCount) {
        // init matrix of zeros
        let adjMat = zeros2D(vertexCount);
        // add 1's to make base path aka circular
        adjMat = addFirstCircularCycleToAdjMat(adjMat);
        console.log(adjMat);
        return adjMat;
    }

    turnAdjMatIntoData(adjMat) {
        let adjData = emptyGraphData;
        let i = 0;
        adjMat.forEach(row => {
            // add node
            adjData.nodes.push({ id: i.toString() });

            let j = 0;
            row.forEach(item => {
                // add link except links already added in other direction or links to itself
                if (item == 1) {
                    if ((i !== j) && !adjData.links.find(st => {
                        return st.source == i.toString() && st.target == j.toString() ||
                            st.source == j.toString() && st.target == i.toString();
                    })) {
                        adjData.links.push({ source: i.toString(), target: j.toString(), color: "lightgray" });
                    }
                }
                j++;
            })
            i++;
        })
        return adjData;
    }

    onClickLink(source, target) {
        let g = this.state.data;
        console.log("double clicked link")
        // keep all links except the link pressed
        g.links = g.links.filter(link => {
            return !(link.source === source && link.target === target)
        });
        //add new node
        let newNode = (g.nodes.length).toString()
        g.nodes.push({ id: newNode });
        // add link from source to new node and from target to new node
        g.links.push(
            { source: newNode, target: source, color: "lightgray" },
            { source: newNode, target: target, color: "lightgray" },
        );
        this.setState({ data: g });
    };

    onClickNode(nodeId) {
        let g = this.state.data;
        g.nodes.push({ id: (g.nodes.length).toString() });
        g.links.push({ source: (nodeId).toString(), target: (g.nodes.length - 1).toString(), color: "lightgray" });
        this.setState({ data: g });
    };

    onRightClickNode(event, nodeId) {
        let g = this.state.data;
        g.nodes = g.nodes.filter(node => {
            return node.id !== nodeId
        });
        g.links = g.links.filter(link => {
            return link.source !== nodeId && link.target !== nodeId
        });
        this.setState({ data: g });
    };

    onRightClickLink(event, source, target) {
        let g = this.state.data;
        g.links = g.links.filter(link => {
            return !((link.source === source && link.target === target) || link.source === target && link.target === source);
        })
        this.setState({ data: g });
    };

    render() {
        const myConfig = {
            nodeHighlightBehavior: true,
            linkHighlightBehavior: true,
            automaticRearrangeAfterDropNode: true,
            height: 600,
            minZoom: 0.8,
            node: {
                color: "#B0C4DE",
                size: 300,
                fontSize: 16,
                highlightStrokeColor: "#A9BCBC",
                highlightFontSize: 18,
                labelPosition: "top",

            },
            link: {
                highlightColor: "#A9BCBC",
                strokeWidth: 4,
                color: "lightgray",
            },
        };
        const reactRef = this;

        function passLastExpToBarChart() {
            let expItems = reactRef.state.stats.filter(item => {
                return item[0] === reactRef.state.experi
            })
            let iterations = expItems.map(item => {
                return item[4]
            })
            return iterations;
        }

        function downloadStats() {
            arrToCSV(reactRef.state.stats, "experiment,edge,given cycle,found cycle,iterations\n", "statsPerEdge.csv");
        }

        function downloadExpStats() {
            arrToCSV(reactRef.state.expStats, "experiment, min iterations, max iterations, avg iterations", "statsPerExp.csv");
        }

        function arrToCSV(array2d, titleRow, filename) {
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += titleRow
            for (var i = 0; i < array2d.length; ++i) {
                for (var j = 0; j < array2d[i].length; ++j) {
                    array2d[i][j] = '\"' + array2d[i][j] + '\"';  // Handle elements that contain commas
                }
                csvContent += array2d[i] + '\n'
            }
            csvContent += '\r\n';
            console.log("csvContent", csvContent);
            var encodedUri = encodeURI(csvContent);
            var link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", filename);
            document.body.appendChild(link); // Required for FF

            link.click();
        }

        return (
            <div className='main-container container-fluid'>
                <div className='row justify-content-lg-center'>
                    <div className="pl-0 pr-0 ml-0 mr-3 experi">
                        <div className="btn navbar-toggle px-5 border-top border-start border-end experiment main-exp purple light">
                            EXPERIMENTS
                        <div className="experiments-overlay">
                                <nav className="navbar navbar-collapse font-italic ">
                                    <Link className="btn navbar-toggle px-5 border-top border-start border-end experiment purple" to="/thomasons-algorithm/experiments/experiment-desc">Graphs</Link>
                                    <Link className="btn navbar-toggle px-5 border-top border-start border-end experiment purple" to="/thomasons-algorithm/experiments/input-your-own">Input Your Own</Link>
                                    <Link className="btn navbar-toggle px-5 border-top border-start border-end experiment purple" to="/thomasons-algorithm/experiments/graph-generator">Graph Genrator</Link>
                                </nav>
                                { /* Route components are rendered if the path prop matches the current URL */}
                                <Route path="/thomasons-algorithm/experiments/experiment-desc"><ExperimentDesc parentCallback={this.handleCallback} /></Route>
                                <Route path="/thomasons-algorithm/experiments/input-your-own"><InputYourOwn adjCallback={this.handleAdjCallback} /></Route>
                                <Route path="/thomasons-algorithm/experiments/graph-generator"><GraphGenerator generatorCallback={this.handleGeneratorCallback} /></Route>
                            </div>
                        </div>
                    </div>
                    <div className="col pl-0 pr-0 ml-0 mr-3">
                        <div className="card p-2">
                            <div id='play-buttons' className="my-1 tab-list">
                                <button id='play'
                                    onClick={this.runOnEachEdge}
                                    className={this.state.viewCompleted ? "active run" : "run"}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                        className="bi bi-play-fill" viewBox="0 0 16 16">
                                        <path
                                            d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
                                    </svg>
                                </button>
                                <button id='pause'
                                    onClick={() => this.displayCompleted(false)}
                                    className={this.state.viewCompleted ? "run" : "active run"}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                        className="bi bi-pause-fill" viewBox="0 0 16 16">
                                        <path
                                            d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z" />
                                    </svg>
                                </button>

                                <button id='stop'
                                    onClick={() => this.displayCompleted(false)}
                                    className={this.state.viewCompleted ? "run" : "active run"}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-stop-fill" viewBox="0 0 16 16">
                                        <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z" />
                                    </svg>
                                </button>

                                <button id='slowdown'
                                    onClick={() => {
                                        let s = this.state.speed;
                                        s = parseInt(s * 2);
                                        this.setState({ speed: s });
                                    }}
                                    className={this.state.viewCompleted ? "run" : "active run"}>
                                    Slow
                                </button>
                                <button id='speedup'
                                    onClick={() => {
                                        let s = this.state.speed;
                                        s = parseInt(s / 2);
                                        this.setState({ speed: s });
                                    }}
                                    className={this.state.viewCompleted ? "run" : "active run"}>
                                    Speed
                                </button>
                                breaks: {this.state.speed} ms
                            </div>
                            <code className="overflow-auto">
                                <div className="line">{"// Function which goes through the Lollipop iterations in a loop, updating P on each iteration"}<br /></div>
                                <div className="line func-title">{"function ThomasonsLollipop(C){"}<br /></div>
                                <div className="line">{"\v\v    let g = reactRef.state.data;"}<br /></div>
                                <div className="line">{"\v\v    let ite = 0;"}<br /></div>
                                <div className="line">{"\v\v    let P = C;"}<br /></div>
                                <div className="line">{""}<br /></div>
                                <div className="line">{"\v\v    // each Step of Lollipop"}<br /></div>
                                <div className="line">{"\v\v    while (true) {"}<br /></div>
                                <div className="line">{"\v\v\v\v      ite += 1;"}<br /></div>
                                <div className="line">{"\v\v\v\v      console.log('ite', ite);"}<br /></div>
                                <div className="line">{"\v\v\v\v      "}<br /></div>
                                <div className="line">{"\v\v\v\v      // get red from g ---------------------------- red is important so we dont select it as blue"}<br /></div>
                                <div className="line">{"\v\v\v\v      let red = g.links.find(link => {"}<br /></div>
                                <div className="line">{"\v\v\v\v        return ((parseInt(link.source) === P[P.length-1][0] && parseInt(link.target) === P[P.length-1][1]) ||"}<br /></div>
                                <div className="line">{"\v\v\v\v\v\v              (parseInt(link.source) === P[P.length-1][1] && parseInt(link.target) === P[P.length-1][0]))"}<br /></div>
                                <div className="line">{"\v\v\v\v      });"}<br /></div>
                                <div className="line">{"\v\v\v\v      // color last edge of cycle red "}<br /></div>
                                <div className="line">{"\v\v\v\v      colorEdge([parseInt(red.source), parseInt(red.target)], 'red');"}<br /></div>
                                <div className="line">{"\v\v\v\v      console.log('red', [parseInt(red.source), parseInt(red.target)]);"}<br /></div>
                                <div className="line">{""}<br /></div>
                                <div className="line">{"\v\v\v\v      // remove red from P"}<br /></div>
                                <div className="line">{"\v\v\v\v      P = P.slice(0,P.length-1);"}<br /></div>
                                <div className="line">{"\v\v\v\v      console.log('P after removed red', P);"}<br /></div>
                                <div className="line">{""}<br /></div>
                                <div className="line">{"\v\v\v\v      // get new last edge of P -------------------- last edge is important so we dont select it as blue"}<br /></div>
                                <div className="line">{"\v\v\v\v      let lastEdge = g.links.find(link => {"}<br /></div>
                                <div className="line">{"\v\v\v\v\v\v        return ((parseInt(link.source) === P[P.length-1][0] && parseInt(link.target) === P[P.length-1][1]) ||"}<br /></div>
                                <div className="line">{"\v\v\v\v\v\v        (parseInt(link.source) === P[P.length-1][1] && parseInt(link.target) === P[P.length-1][0]))"}<br /></div>
                                <div className="line">{"\v\v\v\v      });"}<br /></div>
                                <div className="line">{"\v\v\v\v      console.log('lastEdge',lastEdge);"}<br /></div>
                                <div className="line">{""}<br /></div>
                                <div className="line">{"\v\v\v\v      // get last vertex of P ---------------------- we know we have to select blue going from lastV now"}<br /></div>
                                <div className="line">{"\v\v\v\v      let lastV = P[P.length - 1][1];"}<br /></div>
                                <div className="line">{""}<br /></div>
                                <div className="line">{"\v\v\v\v      // get edge from lastV but not 'red' and not 'lastEdge' then color it blue"}<br /></div>
                                <div className="line">{"\v\v\v\v      let blue = g.links.find(link => {"}<br /></div>
                                <div className="line">{"\v\v\v\v\v\v        return ((parseInt(link.source) === lastV && link !== lastEdge && link !== red) ||"}<br /></div>
                                <div className="line">{"\v\v\v\v\v\v              (parseInt(link.target) === lastV && link !== lastEdge && link !== red))"}<br /></div>
                                <div className="line">{"\v\v\v\v      })"}<br /></div>
                                <div className="line">{""}<br /></div>
                                <div className="line">{"\v\v\v\v      let blueEdge = null"}<br /></div>
                                <div className="line">{"\v\v\v\v      if (parseInt(blue.source) === lastV) {"}<br /></div>
                                <div className="line">{"\v\v\v\v\v\v        blueEdge = [parseInt(blue.target), parseInt(blue.source)]"}<br /></div>
                                <div className="line">{"\v\v\v\v      }"}<br /></div>
                                <div className="line">{"\v\v\v\v      else if (parseInt(blue.target) === lastV){"}<br /></div>
                                <div className="line">{"\v\v\v\v\v\v        blueEdge = [parseInt(blue.source), parseInt(blue.target)];"}<br /></div>
                                <div className="line">{"\v\v\v\v      }"}<br /></div>
                                <div className="line">{""}<br /></div>
                                <div className="line">{"\v\v\v\v      // color blue"}<br /></div>
                                <div className="line">{"\v\v\v\v      colorEdge(blueEdge, 'blue');"}<br /></div>
                                <div className="line">{"\v\v\v\v      console.log('blue', blueEdge);"}<br /></div>
                                <div className="line">{""}<br /></div>
                                <div className="line">{"\v\v\v\v      // reorder P"}<br /></div>
                                <div className="line">{"\v\v\v\v      let newP = []"}<br /></div>
                                <div className="line">{""}<br /></div>
                                <div className="line">{"\v\v\v\v      // add first edges from path until blue edge is reached"}<br /></div>
                                <div className="line">{"\v\v\v\v      let i = 0"}<br /></div>
                                <div className="line">{"\v\v\v\v      for(i; i < P.length; i++){"}<br /></div>
                                <div className="line">{"\v\v\v\v\v\v        if (P[i][0] !== blueEdge[0]){"}<br /></div>
                                <div className="line">{"\v\v\v\v\v\v\v\v          // add to newP"}<br /></div>
                                <div className="line">{"\v\v\v\v\v\v\v\v          newP.push(P[i]);"}<br /></div>
                                <div className="line">{"\v\v\v\v\v\v\v\v          console.log('not blue')"}<br /></div>
                                <div className="line">{"\v\v\v\v\v\v        }"}<br /></div>
                                <div className="line">{"\v\v\v\v\v\v        else{"}<br /></div>
                                <div className="line">{"\v\v\v\v\v\v\v\v          break;"}<br /></div>
                                <div className="line">{"\v\v\v\v\v\v        }"}<br /></div>
                                <div className="line">{"\v\v\v\v      }"}<br /></div>
                                <div className="line">{"\v\v\v\v      console.log('i', i);"}<br /></div>
                                <div className="line">{"\v\v\v\v      "}<br /></div>
                                <div className="line">{"\v\v\v\v      // add blue to newP"}<br /></div>
                                <div className="line">{"\v\v\v\v      newP.push(blueEdge);"}<br /></div>
                                <div className="line">{""}<br /></div>
                                <div className="line">{"\v\v\v\v      let flipped = P.slice(i,P.length).reverse();"}<br /></div>
                                <div className="line">{"\v\v\v\v      console.log('flipped', flipped);"}<br /></div>
                                <div className="line">{""}<br /></div>
                                <div className="line">{"\v\v\v\v      // now add the flipped"}<br /></div>
                                <div className="line">{"\v\v\v\v      flipped.forEach(item => {"}<br /></div>
                                <div className="line">{"\v\v\v\v\v\v        newP.push([item[1], item[0]]);"}<br /></div>
                                <div className="line">{"\v\v\v\v      });"}<br /></div>
                                <div className="line">{"\v\v\v\v      "}<br /></div>
                                <div className="line">{"\v\v\v\v      P = newP;"}<br /></div>
                                <div className="line">{"\v\v\v\v      console.log('P after iteration', P);"}<br /></div>
                                <div className="line">{""}<br /></div>
                                <div className="line">{"\v\v\v\v      // if there is an edge between P[P.length-1][0] && P[0][0] then we connect those and the algorithm is finished."}<br /></div>
                                <div className="line">{"\v\v\v\v      let done = g.links.find(link => {"}<br /></div>
                                <div className="line">{"\v\v\v\v\v\v        return ((parseInt(link.source) === P[P.length-1][0] && parseInt(link.target) === P[0][0]) ||"}<br /></div>
                                <div className="line">{"\v\v\v\v\v\v              (parseInt(link.target) === P[P.length-1][0] && parseInt(link.source) === P[0][0]))"}<br /></div>
                                <div className="line">{"\v\v\v\v      });"}<br /></div>
                                <div className="line">{""}<br /></div>
                                <div className="line">{"\v\v\v\v      // then replace last vert of P to connect to the first initial given edge"}<br /></div>
                                <div className="line">{"\v\v\v\v      if (done){"}<br /></div>
                                <div className="line">{"\v\v\v\v\v\v          P[P.length-1][1] = P[0][0];"}<br /></div>
                                <div className="line">{"\v\v\v\v\v\v          // and color this edge blue for finalized visualization"}<br /></div>
                                <div className="line">{"\v\v\v\v\v\v          colorEdge([parseInt(done.source), parseInt(done.target)], 'blue');"}<br /></div>
                                <div className="line">{"          "}<br /></div>
                                <div className="line">{"\v\v\v\v\v\v          return {ite: ite, newCycle: P};"}<br /></div>
                                <div className="line">{"\v\v\v\v      }"}<br /></div>
                                <div className="line">{"\v\v\v\v    }"}<br /></div>
                                <div className="line">{"\v\v}"}<br /></div>
                            </code>
                        </div>
                    </div>
                    <div className="col pl-0 pr-0 ml-0 mr-3">
                        <div className="card p-2 network graph">
                            <Graph
                                id="graph-id" // id is mandatory
                                data={this.state.data}
                                config={myConfig}
                                onRightClickLink={this.onRightClickLink}
                                onClickNode={this.onClickNode}
                                onClickLink={this.onClickLink}
                                onRightClickNode={this.onRightClickNode}
                                // onClickGraph={runOnEachEdge}
                                playCallback={this.runOnEachEdge}
                            />
                            <div className="row">
                            </div>
                        </div>
                    </div>
                    <div className='main-container container-fluid'>
                        <div className='row justify-content-lg-center'>
                            <div className="col pt-5 pl-0 pr-0 ml-0 mr-3">
                                <div className="card p-2 overflow-auto">
                                    <h1>Stats Dashboard</h1>
                                    <div className="row">
                                        <div className="col">experiment</div>
                                        <div className="col">vertexCount</div>
                                        <div className="col">edge</div>
                                        <div className="col">given cycle</div>
                                        <div className="col">found cycle</div>
                                        <div className="col">iterations</div>
                                    </div>
                                    {this.state.stats.map((item, index) =>
                                        <div className="row">
                                            <div className="col">{item[0]}</div>
                                            <div className="col">{item[5].nodes.length}</div>
                                            <div className="col">({item[1][0]}, {item[1][1]})</div>
                                            <div className="col">{item[2].map((c1) => <>{c1[0]}, </>)}</div>
                                            <div className="col">{item[3].map((c1) => <>{c1}, </>)}</div>
                                            <div className="col">{item[4]}</div>
                                        </div>
                                    )}

                                </div>
                            </div>
                            <div className="col pt-5 pl-0 pr-0 ml-0 mr-3 p-2">
                                <div className="card"></div>
                                <h4 className="bg-light" >Current Experiment Iterations</h4>
                                <BarChart width={630} height={300} data={passLastExpToBarChart()} />
                            </div>
                        </div>

                    </div>
                    <div className="col pt-5 pl-0 pr-0 ml-0 mr-3 p-2">
                        <div className=""><button className="" onClick={downloadStats}>Download CSV: Stats- per each edge</button></div>
                        <div className=""><button className="" onClick={downloadExpStats}>Download CSV: Stats- per each experiment</button></div>
                    </div>
                </div>
            </div>
        )
    }
}

export default function ThomasonsAlgorithmPage() {
    return (
        <Visualization />
    );
}