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
      style={{ width: "10ch" }}
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

const AudioParamController = ({ param }: { param: AudioParam }) => {
  const [value, setValue] = useState(param.value);

  return (
    <MinMaxInput
      value={value}
      onChange={(newValue) => {
        param.value = newValue;
        setValue(newValue);
      }}
      min={param.minValue}
      max={param.maxValue}
    />
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
