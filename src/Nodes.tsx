import { useState } from "react";

type InputProps<T> = {
  value: T;
  onChange: (newValue: T) => any;
};

type Connexions = {
  ctx: boolean;
  // nodes: { [nodeName: string]: boolean };
  // params: { [nodeName: string]: { [paramName: string]: boolean } };
};

type AppNode = {
  connexions: Connexions;
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

const NodeInput = ({
  value,
  onChange,
  ac,
}: InputProps<AppNode> & {
  ac: AudioContext;
}) => {
  return (
    <div>
      <h2>Connexions</h2>
      <ul>
        <li>
          <input
            type="checkbox"
            checked={value.connexions.ctx}
            onChange={(evt) => {
              if (evt.target.checked) {
                value.node.connect(ac.destination);
                value.connexions.ctx = true;
              } else {
                value.node.disconnect(ac.destination);
                value.connexions.ctx = false;
              }
              onChange({ ...value });
            }}
          />
          master
        </li>
      </ul>
    </div>
  );
};

const GraphController = ({ ac }: { ac: AudioContext }) => {
  const [graph, setGraph] = useState<Graph>({});
  const [newNodeName, setNewNodeName] = useState("");

  return (
    <ul>
      {Object.entries(graph).map(([nodeName, appNode]) => (
        <li key={nodeName}>
          <h2>{nodeName}</h2>
          <NodeInput
            value={appNode}
            onChange={(newAppNode) =>
              setGraph({ ...graph, [nodeName]: newAppNode })
            }
            ac={ac}
          />
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
                connexions: { ctx: false },
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
