export type Ctrl = {
  inputs: { [name: string]: AudioNode | AudioParam };
  set: (name: string, value: any) => void;
  connect: (ctrl: Ctrl, name: string) => void;
  disconnect: (ctrl: Ctrl, name: string) => void;
};

type ContextState = {
  kind: "Context";
};

type OscillatorState = {
  kind: "Oscillator";
  detune: number;
  frequency: number;
  type: OscillatorNode["type"];
};

type GainState = {
  kind: "Gain";
  gain: number;
};

type NodeState = ContextState | OscillatorState | GainState;

export type Graph = {
  nodes: {
    [nodeId: string]: NodeState;
  };
  edges: {
    from: string;
    to: string;
    name: string;
  }[];
};
