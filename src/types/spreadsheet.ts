export type FillRule =
  | { type: "literal"; value: string | number }
  | { type: "median" }
  | { type: "empty" }
  | { type: "forward" }
