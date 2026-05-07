const tickerData = [
    { sym: 'AAPL', price: '189.42', chg: '+1.24%', up: true },
    { sym: 'GOOGL', price: '174.15', chg: '+0.87%', up: true },
    { sym: 'NVDA', price: '924.73', chg: '+3.12%', up: true },
    { sym: 'TSLA', price: '177.58', chg: '-1.45%', up: false },
    { sym: 'MSFT', price: '415.32', chg: '+0.56%', up: true },
    { sym: 'META', price: '502.77', chg: '+2.01%', up: true },
    { sym: 'AMZN', price: '186.13', chg: '+0.15%', up: true },
    { sym: 'AMD', price: '160.20', chg: '-2.40%', up: false },
    { sym: 'BTC', price: '64,250', chg: '+1.50%', up: true },
    { sym: 'ETH', price: '3,450', chg: '+2.10%', up: true },
    { sym: 'NFLX', price: '610.50', chg: '-0.80%', up: false },
    { sym: 'COIN', price: '225.30', chg: '+4.20%', up: true },
];
const track = document.getElementById('ticker');
const items = [...tickerData, ...tickerData].map(d => `
    <div class="ticker-item">
        <span class="ticker-sym">${d.sym}</span>
        <span class="ticker-price">$${d.price}</span>
        <span class="ticker-chg ${d.up ? 'up' : 'dn'}">${d.chg}</span>
    </div>
`).join('');
track.innerHTML = items;

// ── Scroll Reveal ──
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });
reveals.forEach(el => observer.observe(el));
