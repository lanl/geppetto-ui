const percent = new Intl.NumberFormat(undefined, { style: "percent" });

export default function score(value) {
  return percent.format(1 - value);
}
