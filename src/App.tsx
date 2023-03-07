import { Dispatch, SetStateAction, useState } from "react";
import { createCtrl, createMap } from "./lib";
import { Ctrl, Graph } from "./types";

const defaultStates = {
  Oscillator: {
    kind: "Oscillator",
    frequency: 200,
    detune: 0,
    type: "sawtooth",
  },
  Gain: {
    kind: "Gain",
    gain: 0.5,
  },
} as const;

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

const NewNodeInput = ({
  graph,
  setGraph,
  map,
  ac,
}: {
  graph: Graph;
  setGraph: Dispatch<SetStateAction<Graph>>;
  map: { [nodeId: string]: Ctrl };
  ac: AudioContext;
}) => {
  const [nodeId, setNodeId] = useState("");
  const [kind, setKind] = useState<"Oscillator" | "Gain">("Oscillator");
  return (
    <>
      <input
        type="text"
        value={nodeId}
        onChange={(evt) => setNodeId(evt.target.value)}
      />
      <select
        value={kind}
        onChange={(evt) => {
          // @ts-ignore
          setKind(evt.target.value);
        }}
      >
        {["Oscillator", "Gain"].map((newKind) => (
          <option key={newKind}>{newKind}</option>
        ))}
      </select>
      <button
        onClick={() => {
          map[nodeId] = createCtrl(ac, kind);
          setGraph({
            ...graph,
            nodes: { ...graph.nodes, [nodeId]: defaultStates[kind] },
          });
        }}
      >
        add
      </button>
    </>
  );
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
        <tr style={{ writingMode: "sideways-lr", textAlign: "left" }}>
          <td></td>
          {tos.map(({ to, name }) => (
            <td key={`${to}.${name}`}>
              {to} {name}
            </td>
          ))}
        </tr>
        {froms
          .filter((from) => graph.nodes[from].kind !== "Context")
          .map((from) => (
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
  const [ac, setAc] = useState<null | AudioContext>(null);

  const start = () => {
    const ac = new AudioContext();
    const map = createMap(ac, graph);
    setAc(ac);
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
                    {key}:
                    {node.kind === "Oscillator" && key === "frequency" && (
                      <input
                        type="range"
                        min={0}
                        max={1000}
                        value={value}
                        onChange={(evt) => {
                          const x = +evt.target.value;
                          map[nodeId].set(key, x);
                          // @ts-ignore
                          graph.nodes[nodeId][key] = x;
                          setGraph({ ...graph });
                        }}
                      />
                    )}
                    {node.kind === "Gain" && key === "gain" && (
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step="any"
                        value={value}
                        onChange={(evt) => {
                          const x = +evt.target.value;
                          map[nodeId].set(key, x);
                          // @ts-ignore
                          graph.nodes[nodeId][key] = x;
                          setGraph({ ...graph });
                        }}
                      />
                    )}
                    {node.kind === "Oscillator" && key === "type" && (
                      <select
                        value={value}
                        onChange={(evt) => {
                          const x = evt.target.value;
                          map[nodeId].set(key, x);
                          // @ts-ignore
                          graph.nodes[nodeId][key] = x;
                          setGraph({ ...graph });
                        }}
                      >
                        {[
                          "sine",
                          "custom",
                          "sawtooth",
                          "square",
                          "triangle",
                        ].map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    )}
                    {value}
                  </li>
                ))}
            </ul>
          </li>
        ))}
        <li>
          <NewNodeInput {...{ map, graph, setGraph, ac: ac! }} />
        </li>
      </ul>
      <Matrix {...{ map, graph, setGraph }} />
    </>
  ) : (
    <button onClick={start}>start</button>
  );
};
