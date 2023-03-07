import { Ctrl, Graph } from "./types";

const createContextCtrl = (ac: AudioContext): Ctrl => {
  return {
    inputs: { default: ac.destination },
    set() {},
    connect() {},
    disconnect() {},
  };
};

const createOscillatorCtrl = (ac: AudioContext): Ctrl => {
  const osc = new OscillatorNode(ac);
  osc.start();
  return {
    inputs: {
      detune: osc.detune,
      frequency: osc.frequency,
    },
    set(name, value) {
      if (name === "detune") osc.detune.value = value;
      if (name === "frequency") osc.frequency.value = value;
      if (name === "type") osc.type = value;
    },
    connect(ctrl, name) {
      // @ts-ignore
      osc.connect(ctrl.inputs[name]);
    },
    disconnect(ctrl, name) {
      // @ts-ignore
      osc.disconnect(ctrl.inputs[name]);
    },
  };
};

const createGainCtrl = (ac: AudioContext): Ctrl => {
  const gain = new GainNode(ac);
  return {
    inputs: {
      default: gain,
    },
    set(name, value) {
      // @ts-ignore
      gain[name].value = value;
    },
    connect(ctrl, name) {
      // @ts-ignore
      gain.connect(ctrl.inputs[name]);
    },
    disconnect(ctrl, name) {
      // @ts-ignore
      gain.disconnect(ctrl.inputs[name]);
    },
  };
};

export const createCtrl = (
  ac: AudioContext,
  kind: "Context" | "Oscillator" | "Gain"
) =>
  ({
    Context: createContextCtrl,
    Oscillator: createOscillatorCtrl,
    Gain: createGainCtrl,
  }[kind](ac));

export const createMap = (ac: AudioContext, graph: Graph) => {
  const map: { [nodeId: string]: Ctrl } = {};

  for (const nodeId in graph.nodes) {
    const node = graph.nodes[nodeId];
    map[nodeId] = createCtrl(ac, node.kind);
    for (const name in node) {
      if (name === "kind") continue;
      map[nodeId].set(name, node[name as keyof typeof node]);
    }
  }

  for (const { from, to, name } of graph.edges) {
    map[from].connect(map[to], name);
  }

  return map;
};
