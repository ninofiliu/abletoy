import { useEffect, useState } from "react";

const ObjectSelectInput = <T,>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (newValue: T) => any;
  options: { [name: string]: T };
}) => {
  const stringValue = Object.entries(options).find(([k, v]) => v === value)![0];
  return (
    <select
      value={stringValue}
      onChange={(evt) => {
        onChange(options[evt.target.value]!);
      }}
    >
      {Object.keys(options).map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </select>
  );
};

const OscillatorController = ({
  osc,
  nodes,
}: {
  osc: OscillatorNode;
  nodes: OscillatorNode[];
}) => {
  const [type, setType] = useState<OscillatorNode["type"]>(osc.type);
  const types = [
    "custom",
    "sawtooth",
    "sine",
    "square",
    "triangle",
  ] as OscillatorNode["type"][];
  const [con, setCon] = useState<AudioDestinationNode>(osc.context.destination);
  const conOptions: { [name: string]: AudioDestinationNode } = {
    ac: osc.context.destination,
    ...Object.fromEntries(nodes.map((node, i) => [i, node.frequency])),
  };

  return (
    <div>
      <TextSelectInput
        value={type}
        onChange={(newType) => {
          osc.type = newType;
          setType(newType);
        }}
        options={types}
      />
      <AudioParamController param={osc.frequency} />
      <ObjectSelectInput
        value={con}
        onChange={(newCon) => {
          console.log({ newCon });
          osc.connect(newCon);
          setCon(newCon);
        }}
        options={conOptions}
      />
    </div>
  );
};

const ConnexionsController = ({
  from,
  graph,
  value,
  onChange,
}: {
  from: AudioNode | AudioParam;
  graph: Graph;
} & InputProps<Connexion>) => {
  return <ul></ul>;
};

const GainController = ({ name, node }: { name: string; node: GainNode }) => {
  return (
    <div style={{ border: "1px solid white", margin: ".5em", padding: ".5em" }}>
      <h1>{name}</h1>
      <AudioParamController param={node.gain} />
    </div>
  );
};

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
  | {
      kind: "BiquadFilterNode";
      native: BiquadFilterNode;
      type: BiquadFilterNode["type"];
      frequency: BiquadFilterNode["frequency"]["value"];
      gain: BiquadFilterNode["gain"]["value"];
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

const NumberInput = ({
  value,
  onChange,
  min,
  max,
}: {
  value: number;
  onChange: (newValue: number) => any;
  min?: number;
  max?: number;
}) => {
  const [str, setStr] = useState(`${value}`);
  useEffect(() => {
    setStr(`${value}`);
  }, [value]);
  return (
    <input
      type="number"
      value={str}
      min={min}
      max={max}
      onChange={(evt) => {
        const newStr = evt.target.value;
        setStr(newStr);
        const newValue = parseFloat(newStr);
        if (!isNaN(newValue)) onChange(newValue);
      }}
    />
  );
};

const MinMaxInput = ({
  value,
  onChange,
  min,
  max,
}: {
  value: number;
  onChange: (newValue: number) => any;
  min: number;
  max: number;
}) => {
  const [localMin, setLocalMin] = useState(min);
  const [localMax, setLocalMax] = useState(max);

  return (
    <div>
      <span>{min}</span>
      <NumberInput
        value={localMin}
        onChange={setLocalMin}
        min={min}
        max={localMax}
      />
      <input
        type="range"
        value={value}
        onChange={(evt) => onChange(parseFloat(evt.target.value))}
        min={localMin}
        max={localMax}
      />
      <NumberInput
        value={value}
        onChange={onChange}
        min={localMin}
        max={localMax}
      />
      <span>{max}</span>
      <NumberInput
        value={localMax}
        onChange={setLocalMax}
        min={localMin}
        max={max}
      />
    </div>
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
    value.kind = newKind;
    value.native.disconnect();
    if (newKind === "BiquadFilterNode") {
      value.native = new BiquadFilterNode(ac);
    }
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
      options={["BiquadFilterNode", "GainNode", "OscillatorNode"]}
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
      {value.kind === "BiquadFilterNode" && (
        <div>
          <TextSelectInput
            value={value.type}
            onChange={(newParamValue) => {
              value.native.type = newParamValue;
              value.type = newParamValue;
              onChange({ ...value, type: newParamValue });
            }}
            options={[
              "allpass",
              "bandpass",
              "highpass",
              "highshelf",
              "lowpass",
              "lowshelf",
              "notch",
              "peaking",
            ]}
          />
          <MinMaxInput
            value={value.frequency}
            onChange={(newParamValue) => {
              value.native.frequency.value = newParamValue;
              onChange({ ...value, frequency: newParamValue });
            }}
            min={value.native.frequency.minValue}
            max={value.native.frequency.maxValue}
          />
          <MinMaxInput
            value={value.gain}
            onChange={(newParamValue) => {
              value.native.gain.value = newParamValue;
              onChange({ ...value, gain: newParamValue });
            }}
            min={value.native.gain.minValue}
            max={value.native.gain.maxValue}
          />
        </div>
      )}
      {value.kind === "GainNode" && (
        <div>
          <MinMaxInput
            value={value.gain}
            onChange={(newParamValue) => {
              value.native.gain.value = newParamValue;
              onChange({ ...value, gain: newParamValue });
            }}
            min={value.native.gain.minValue}
            max={value.native.gain.maxValue}
          />
        </div>
      )}
      {value.kind === "OscillatorNode" && (
        <div>
          <TextSelectInput
            value={value.type}
            onChange={(newParamValue) => {
              value.native.type = newParamValue;
              value.type = newParamValue;
              onChange({ ...value, type: newParamValue });
            }}
            options={["custom", "sawtooth", "sine", "square", "triangle"]}
          />
          <MinMaxInput
            value={value.frequency}
            onChange={(newParamValue) => {
              value.native.frequency.value = newParamValue;
              onChange({ ...value, frequency: newParamValue });
            }}
            min={value.native.frequency.minValue}
            max={value.native.frequency.maxValue}
          />
        </div>
      )}
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
import { useRef, useState } from "react";

let used = false;
const useOnce = (cb: () => any) => {
  if (used) return;
  used = true;
  cb();
};

type Instrument = { kind: "kick" };

const KickController = () => {
  return <></>;
};

const InstrumentController = ({ instrument }: { instrument: Instrument }) => {
  const Controller = { kick: KickController }[instrument.kind];
  return <Controller />;
};

export default () => {
  const [instruments, setInstruments] = useState<{
    [name: string]: Instrument;
  }>({});
  const [newInstrumentName, setNewInstrumentName] = useState("");
  const [sheet, setSheet] = useState<{
    [name: string]: { instrumentName: string };
  }>({});
  const [newSheetName, setNewSheetName] = useState("");

  useOnce(() => {
    console.log("addig");
    setInstruments({ myKick: { kind: "kick" } });
  });

  return (
    <>
      <h1>Instruments</h1>
      <ul>
        {Object.entries(instruments).map(([name, instrument]) => (
          <li key={name}>
            {name}
            <button
              onClick={() => {
                delete instruments[name];
                setInstruments({ ...instruments });
              }}
            >
              x
            </button>
            <InstrumentController instrument={instrument} />
          </li>
        ))}
      </ul>
      <input
        value={newInstrumentName}
        onChange={(evt) => setNewInstrumentName(evt.target.value)}
      />
      <button
        disabled={newInstrumentName in instruments}
        onClick={() => {
          setInstruments({
            ...instruments,
            [newInstrumentName]: { kind: "kick" },
          });
          setNewInstrumentName("");
        }}
      >
        add instrument
      </button>
      <h1>Sheet</h1>
      <ul>
        {Object.entries(sheet).map(([name, { instrumentName }]) => (
          <li key={name}>
            {name}
            <select value={instrumentName}>
              {Object.keys(instruments).map((name) => (
                <option>{name}</option>
              ))}
            </select>
            {Array.from({ length: 16 }, (_, barI) => (
              <input key={barI} type="checkbox" />
            ))}
          </li>
        ))}
      </ul>
      {Object.keys(instruments).length > 0 && (
        <>
          <input
            value={newSheetName}
            onChange={(evt) => setNewSheetName(evt.target.value)}
          />
          <button
            onClick={() => {
              setSheet({ ...sheet });
              setNewSheetName("");
            }}
          >
            add sheet
          </button>
        </>
      )}
    </>
  );
};
