import { options as line } from "./line";

const nameOptions = {
  line
};

export function getPatternOptions(type, prefix) {
  const options = nameOptions[type] || line;
  return options.map(({ key, ...rest }) => ({
    key: `${prefix}.${key}`,
    ...rest
  }));
}