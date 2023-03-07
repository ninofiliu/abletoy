import { Dispatch, SetStateAction, useState } from "react";
import { createMap } from "./lib";
import { Ctrl, Graph } from "./types";

const defaultGraph: Graph = {
  nodes: {
    sine: {
      kind: "Oscillator",
      detune: 0,
      frequency: 200,
      type: "square",
    },
    amp: {
      kind: "Gain",
      gain: 0.5,
    },
    master: {
      kind: "Context",
    },
  },
  edges: [
    { from: "sine", to: "amp", name: "default" },
    { from: "amp", to: "master", name: "default" },
  ],
};

const MatrixInput = ({
  graph,
  setGraph,
  map,
  from,
  to,
  name,
}: {
  graph: Graph;
  setGraph: Dispatch<SetStateAction<Graph>>;
  map: { [nodeId: string]: Ctrl };
  from: string;
  to: string;
  name: string;
}) => {
  const isCurrent = (edge: Graph["edges"][number]) =>
    edge.from === from && edge.to === to && edge.name === name;
  const connect = () => {
    setGraph({
      ...graph,
      edges: [...graph.edges, { from, to, name }],
    });
    map[from].connect(map[to], name);
  };
  const disconnect = () => {
    setGraph({
      ...graph,
      edges: graph.edges.filter(
        (edge) => !(edge.from === from && edge.to === to && edge.name === name)
      ),
    });
    map[from].disconnect(map[to], name);
  };
  return (
    <input
      type="checkbox"
      checked={graph.edges.some(isCurrent)}
      onChange={(evt) => (evt.target.checked ? connect() : disconnect())}
    />
  );
};

const Matrix = ({
  graph,
  setGraph,
  map,
}: {
  graph: Graph;
  setGraph: Dispatch<SetStateAction<Graph>>;
  map: { [nodeId: string]: Ctrl };
}) => {
  const froms = Object.keys(graph.nodes);
  const tos = Object.entries(graph.nodes).flatMap(([to, node]) =>
    ({
      Oscillator: ["detune", "frequency"],
      Gain: ["default"],
      Context: ["default"],
    }[node.kind].map((name) => ({ to, name })))
  );
  return (
    <table>
      <tbody>
        <tr>
          <td></td>
          {tos.map(({ to, name }) => (
            <td key={`${to}.${name}`}>
              {to} {name}
            </td>
          ))}
        </tr>
        {froms.map((from) => (
          <tr key={from}>
            <td>{from}</td>
            {tos.map(({ to, name }) => (
              <td key={`${to}.${name}`}>
                <MatrixInput {...{ graph, setGraph, map, from, to, name }} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default () => {
  const [graph, setGraph] = useState(defaultGraph);
  const [map, setMap] = useState<null | { [nodeId: string]: Ctrl }>(null);

  const start = () => {
    const ac = new AudioContext();
    const map = createMap(ac, graph);
    setMap(map);
  };

  return map ? (
    <>
      <ul>
        {Object.entries(graph.nodes).map(([nodeId, node]) => (
          <li key={nodeId}>
            ({node.kind}) {nodeId}
            <ul>
              {Object.entries(node)
                .filter(([key]) => key !== "kind")
                .map(([key, value]) => (
                  <li key={key}>
                    {key}: {value}
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ul>
      <Matrix {...{ map, graph, setGraph }} />
    </>
  ) : (
    <button onClick={start}>start</button>
  );
};
