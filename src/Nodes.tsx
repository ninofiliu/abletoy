import { useEffect, useState } from "react";

const SelectInput = <T extends string>({
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

const OscillatorController = ({ osc }: { osc: OscillatorNode }) => {
  const [type, setType] = useState<OscillatorNode["type"]>(osc.type);
  const types = [
    "custom",
    "sawtooth",
    "sine",
    "square",
    "triangle",
  ] as OscillatorNode["type"][];

  const [frequency, setFrequency] = useState(osc.frequency.value);

  return (
    <>
      <SelectInput
        value={type}
        onChange={(newType) => {
          osc.type = newType;
          setType(newType);
        }}
        options={types}
      />
      <MinMaxInput
        value={frequency}
        onChange={(newFrequency) => {
          osc.frequency.value = newFrequency;
          setFrequency(newFrequency);
        }}
        min={osc.frequency.minValue}
        max={osc.frequency.maxValue}
      />
    </>
  );
};

export default () => {
  const [state, setState] = useState<
    { kind: "idle" } | { kind: "started"; osc: OscillatorNode }
  >({ kind: "idle" });

  const start = async () => {
    const ac = new AudioContext();
    if (ac.state !== "running") await ac.resume();
    const osc = new OscillatorNode(ac);
    osc.start();
    osc.connect(ac.destination);
    setState({ kind: "started", osc });
  };

  return state.kind === "idle" ? (
    <button onClick={start}>start</button>
  ) : (
    <OscillatorController osc={state.osc} />
  );
};
