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
