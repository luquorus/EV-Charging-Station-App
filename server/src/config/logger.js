// Simple structured logger using console.
// Có thể thay bằng pino/winston sau này mà không đổi API.

/* eslint-disable no-console */

function formatMeta(meta) {
  if (!meta) return '';
  try {
    return JSON.stringify(meta);
  } catch {
    return String(meta);
  }
}

const logger = {
  info(meta, msg) {
    if (typeof meta === 'string') {
      console.log('[INFO]', meta);
    } else {
      console.log('[INFO]', msg || '', formatMeta(meta));
    }
  },

  warn(meta, msg) {
    if (typeof meta === 'string') {
      console.warn('[WARN]', meta);
    } else {
      console.warn('[WARN]', msg || '', formatMeta(meta));
    }
  },

  error(meta, msg) {
    if (meta instanceof Error) {
      console.error('[ERROR]', meta.message, meta.stack);
    } else if (typeof meta === 'string') {
      console.error('[ERROR]', meta);
    } else {
      console.error('[ERROR]', msg || '', formatMeta(meta));
    }
  },
};

module.exports = { logger };
