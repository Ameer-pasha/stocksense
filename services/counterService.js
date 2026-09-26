const Counter = require('../models/Counter');

async function nextNumber(key, prefix, session) {
  const counter = await Counter.findOneAndUpdate(
    { _id: key }, { $inc: { seq: 1 } },
    { upsert: true, new: true, session, setDefaultsOnInsert: false }
  );
  return `${prefix}-${String(counter.seq).padStart(4, '0')}`;
}

module.exports = { nextNumber };
