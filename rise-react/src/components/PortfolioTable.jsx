// Small component with props — renders portfolio table

export default function PortfolioTable({ holdings, getPrice }) {
  const symbols = Object.keys(holdings);

  if (symbols.length === 0) {
    return <p>No stocks owned yet.</p>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr><th>Symbol</th><th>Qty</th><th>Avg</th><th>Value</th></tr>
      </thead>
      <tbody>
        {symbols.map(function (sym) {
          const row = holdings[sym];
          const value = row.qty * getPrice(sym);
          return (
            <tr key={sym}>
              <td>{sym}</td>
              <td>{row.qty}</td>
              <td>${row.avg.toFixed(2)}</td>
              <td>${value.toFixed(2)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
