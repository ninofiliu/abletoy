import { useState } from "react";

type InputProps<T> = {
  value: T;
  onChange: (newValue: T) => any;
};

type Connexions = {
  ctx: boolean;
  nodes: { [nodeName: string]: boolean };
  // TODO
  // params: { [nodeName: string]: { [paramName: string]: boolean } };
};

type Node = {
  connexions: Connexions;
} & (
  | {
      kind: "OscillatorNode";
      native: OscillatorNode;
      type: OscillatorNode["type"];
      frequency: OscillatorNode["frequency"]["value"];
    }
  | {
      kind: "GainNode";
      native: GainNode;
      gain: GainNode["gain"]["value"];
    }
);

type Graph = {
  [nodeName: string]: Node;
};

const TextSelectInput = <T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (newValue: T) => any;
  options: T[];
}) => {
  return (
    <select value={value} onChange={(evt) => onChange(evt.target.value as T)}>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

const KindInput = ({
  value,
  onChange,
  ac,
  graph,
}: InputProps<Node> & {
  ac: AudioContext;
  graph: Graph;
}) => {
  const onKindChange = (newKind: Node["kind"]) => {
    value.native.disconnect();
    if (newKind === "GainNode") {
      value.native = new GainNode(ac);
    }
    if (newKind === "OscillatorNode") {
      value.native = new OscillatorNode(ac);
      value.native.start();
    }
    if (value.connexions.ctx) value.native.connect(ac.destination);
    for (const name in value.connexions.nodes) {
      if (value.connexions.nodes[name]) {
        value.native.connect(graph[name].native);
      }
    }
    onChange({ ...value });
  };

  return (
    <TextSelectInput
      value={value.kind}
      onChange={onKindChange}
      options={["GainNode", "OscillatorNode"]}
    />
  );
};

const ConnexionsInput = ({
  value,
  onChange,
  ac,
  graph,
}: InputProps<Node> & {
  ac: AudioContext;
  graph: Graph;
}) => {
  const onMasterChange = (checked: boolean) => {
    if (checked) {
      value.native.connect(ac.destination);
      value.connexions.ctx = true;
    } else {
      value.native.disconnect(ac.destination);
      value.connexions.ctx = false;
    }
    onChange({ ...value });
  };

  const onNodeChange = (checked: boolean, name: string, to: Node) => {
    if (checked) {
      value.native.connect(to.native);
      value.connexions.nodes[name] = true;
    } else {
      value.native.disconnect(to.native);
      value.connexions.nodes[name] = false;
    }
    onChange({ ...value });
  };

  return (
    <ul>
      <li>
        <input
          type="checkbox"
          checked={value.connexions.ctx}
          onChange={(evt) => onMasterChange(evt.target.checked)}
        />
        master
      </li>
      {Object.entries(graph)
        .filter(([, to]) => to !== value)
        .map(([name, to]) => (
          <li key={name}>
            <input
              type="checkbox"
              checked={value.connexions.nodes[name] ?? false}
              onChange={(evt) => onNodeChange(evt.target.checked, name, to)}
            />
            {name}
          </li>
        ))}
    </ul>
  );
};

const NodeInput = ({
  value,
  onChange,
  ac,
  graph,
}: InputProps<Node> & {
  ac: AudioContext;
  graph: Graph;
}) => {
  return (
    <div>
      <KindInput value={value} onChange={onChange} ac={ac} graph={graph} />
      <ConnexionsInput
        value={value}
        onChange={onChange}
        ac={ac}
        graph={graph}
      />
    </div>
  );
};

const GraphController = ({ ac }: { ac: AudioContext }) => {
  const [graph, setGraph] = useState<Graph>({});
  const [newNodeName, setNewNodeName] = useState("");
  const addNode = () => {
    const node = new OscillatorNode(ac);
    node.start();
    setGraph({
      ...graph,
      [newNodeName]: {
        connexions: { ctx: false, nodes: {} },
        kind: "OscillatorNode",
        native: node,
        type: node.type,
        frequency: node.frequency.value,
      },
    });
    setNewNodeName("");
  };

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
            graph={graph}
          />
        </li>
      ))}
      <li>
        <input
          value={newNodeName}
          onChange={(evt) => setNewNodeName(evt.target.value)}
        />
        <button disabled={newNodeName in graph} onClick={addNode}>
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
