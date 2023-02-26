import { useState } from "react";

type Instrument = {};

export default () => {
  const [instruments, setInstrument] = useState<{ [name: string]: Instrument }>(
    {}
  );
  const [newInstrumentName, setNewInstrumentName] = useState("");
  const [sheet, setSheet] = useState<{
    [name: string]: { instrumentName: string };
  }>({});
  const [newSheetName, setNewSheetName] = useState("");

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
                setInstrument({ ...instruments });
              }}
            >
              x
            </button>
            <pre>{JSON.stringify(instrument)}</pre>{" "}
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
          setInstrument({ ...instruments, [newInstrumentName]: {} });
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
