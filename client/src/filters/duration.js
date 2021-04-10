export default function duration(value, fractionalSecondDigits = 0) {
  const duration = Number(value);
  const parts = [];

  if (!Number.isFinite(duration)) {
    return "";
  }

  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;

  if (hours > 0) {
    parts.push(hours.toLocaleString());
  }

  parts.push(
    minutes.toLocaleString(undefined, {
      minimumIntegerDigits: hours > 0 ? 2 : 1
    })
  );

  parts.push(
    seconds.toLocaleString(undefined, {
      minimumIntegerDigits: 2,
      minimumFractionDigits: fractionalSecondDigits,
      maximumFractionDigits: fractionalSecondDigits
    })
  );

  return parts.join(":");
}
