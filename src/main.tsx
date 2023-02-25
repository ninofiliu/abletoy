import React from "react";
import ReactDOM from "react-dom/client";

const ex = <T,>(x: T | null | undefined): T => {
  if (x === null || x === undefined) throw new Error("should not be nullish");
  return x;
};

ReactDOM.createRoot(ex(document.getElementById("root"))).render(
  <React.StrictMode />
);
