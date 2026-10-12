function parseId(id) {
  const value = Number(id);

  if (!Number.isInteger(value) || value <= 0) {
    return null;
  }

  return value;
}

module.exports = {
  parseId
};