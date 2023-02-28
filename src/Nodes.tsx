import { useState } from "react";

const SelectInput = <T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (newValue: T) => any;
  options: T[];
}) => (
  <select value={value} onChange={(evt) => onChange(evt.target.value as T)}>
    {options.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
);

const OscillatorController = ({ osc }: { osc: OscillatorNode }) => {
  const [type, setType] = useState<OscillatorNode["type"]>(osc.type);
  const types = [
    "custom",
    "sawtooth",
    "sine",
    "square",
    "triangle",
  ] as OscillatorNode["type"][];
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
