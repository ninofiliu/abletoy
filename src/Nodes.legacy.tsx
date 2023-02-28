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
