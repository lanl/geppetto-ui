exports.parseBoolean = value => {
  return ["1", "true", "yes"].includes(String(value).toLowerCase());
};

exports.parseTags = tags => {
  if (!tags) {
    return {};
  }

  return Object.fromEntries(tags.split(",").map(tag => tag.split("=")));
};

exports.parseTagNames = tagNames => {
  if (!tagNames) {
    return {};
  }

  return Object.fromEntries(
    tagNames.split(",").map(tagName => [tagName, null])
  );
};
