const mongoose = require('mongoose');
const { AppError } = require('./errors');

function objectId(value, field = 'id') {
  if (value instanceof mongoose.Types.ObjectId) return value;
  if (typeof value !== 'string' || !/^[\da-f]{24}$/i.test(value)) {
    throw new AppError(400, `${field} must be a valid ObjectId`);
  }
  return new mongoose.Types.ObjectId(value);
}

function requiredString(value, field) {
  if (typeof value !== 'string' || !value.trim()) throw new AppError(400, `${field} is required`);
  return value.trim();
}

function integer(value, field, min = 0) {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < min) {
    throw new AppError(400, `${field} must be an integer >= ${min}`);
  }
  return value;
}

function nonNegativeNumber(value, field) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new AppError(400, `${field} must be a non-negative number`);
  }
  return value;
}

function positiveQueryInt(raw, fallback, max = 100) {
  if (raw === undefined) return fallback;
  if (typeof raw !== 'string' || !/^[1-9]\d*$/.test(raw) ||
      !Number.isSafeInteger(Number(raw)) || Number(raw) > max) {
    throw new AppError(400, `Expected an integer between 1 and ${max}`);
  }
  return Number(raw);
}

function dateFilter(query, startKey = 'start_date', endKey = 'end_date', field = 'createdAt') {
  const { [startKey]: start, [endKey]: end } = query;
  if (start === undefined && end === undefined) return {};
  const range = {};
  function parse(raw, isEnd) {
    if (typeof raw !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T.+)?$/.test(raw)) {
      throw new AppError(400, 'Dates must be ISO dates or YYYY-MM-DD');
    }
    const date = new Date(raw);
    if (!Number.isFinite(date.getTime()) || (raw.length === 10 && date.toISOString().slice(0, 10) !== raw)) {
      throw new AppError(400, 'Invalid date');
    }
    if (isEnd && raw.length === 10) date.setUTCDate(date.getUTCDate() + 1);
    return date;
  }
  if (start !== undefined) range.$gte = parse(start, false);
  if (end !== undefined) range[end.length === 10 ? '$lt' : '$lte'] = parse(end, true);
  if (start !== undefined && end !== undefined && range.$gte > (range.$lt || range.$lte)) {
    throw new AppError(400, 'start_date must be before end_date');
  }
  return { [field]: range };
}

module.exports = { objectId, requiredString, integer, nonNegativeNumber, positiveQueryInt, dateFilter };
