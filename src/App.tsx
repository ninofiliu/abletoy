import { useState } from "react";
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

export default () => {
  const [graph, setGraph] = useState(defaultGraph);
  const [map, setMap] = useState<null | { [nodeId: string]: Ctrl }>(null);

  const start = () => {
    const ac = new AudioContext();
    const map = createMap(ac, graph);
    setMap(map);
  };

  return map ? (
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
  ) : (
    <button onClick={start}>start</button>
  );
};
