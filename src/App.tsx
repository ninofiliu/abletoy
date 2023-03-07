import { createMap } from "./lib";
import { Graph } from "./types";

const graph: Graph = {
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
  const start = () => {
    const ac = new AudioContext();
    const map = createMap(ac, graph);
  };

  return <button onClick={start}>start</button>;
};
