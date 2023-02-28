import { useState } from "react";

type InputProps<T> = {
  value: T;
  onChange: (newValue: T) => any;
};

type Connexion =
  | { kind: "ctx" }
  | { kind: "node"; nodeName: string }
  | { kind: "param"; nodeName: string; paramName: string };

type AppNode = {
  connexions: Connexion[];
} & (
  | {
      kind: "OscillatorNode";
      node: OscillatorNode;
      type: OscillatorNode["type"];
      frequency: OscillatorNode["frequency"]["value"];
    }
  | {
      kind: "GainNode";
      node: GainNode;
      gain: GainNode["gain"]["value"];
    }
);

type Graph = {
  [nodeName: string]: AppNode;
};

const NodeController = ({ appNode }: { appNode: AppNode }) => {
  return <>TODO</>;
};

const GraphController = ({ ac }: { ac: AudioContext }) => {
  const [graph, setGraph] = useState<Graph>({});

  const [newNodeName, setNewNodeName] = useState("");

  return (
    <ul>
      {Object.entries(graph).map(([nodeName, appNode]) => (
        <li key={nodeName}>
          <h2>{nodeName}</h2>
          <NodeController appNode={appNode} />
        </li>
      ))}
      <li>
        <input
          value={newNodeName}
          onChange={(evt) => setNewNodeName(evt.target.value)}
        />
        <button
          disabled={newNodeName in graph}
          onClick={() => {
            const node = new OscillatorNode(ac);
            node.start();
            setGraph({
              ...graph,
              [newNodeName]: {
                connexions: [],
                kind: "OscillatorNode",
                node,
                type: node.type,
                frequency: node.frequency.value,
              },
            });
            setNewNodeName("");
          }}
        >
          add sine
        </button>
      </li>
    </ul>
  );
};

export default () => {
  const [state, setState] = useState<
    { kind: "idle" } | { kind: "started"; ac: AudioContext }
  >({
    kind: "idle",
  });

  const start = async () => {
    const ac = new AudioContext();
    if (ac.state !== "running") await ac.resume();
    setState({ kind: "started", ac });
  };

  return state.kind === "idle" ? (
    <button onClick={start}>start</button>
  ) : (
    <GraphController ac={state.ac} />
  );
};
