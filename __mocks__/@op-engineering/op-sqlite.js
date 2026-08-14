const noopAsync = () => Promise.resolve({ rows: [], rowsAffected: 0, insertId: undefined });

module.exports = {
  open: () =>
    new Proxy(
      {},
      {
        get: () => noopAsync,
      },
    ),
};
