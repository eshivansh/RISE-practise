(function() {

    const CONFIG = {
        marketApiKey: "",
        geminiApiKey: "",
        trackedSymbols: ["AAPL", "GOOGL", "NVDA", "TSLA", "MSFT", "BA"],
        defaultSymbol: "AAPL",
        autoRefreshSeconds: 60
    };

    if (window.APP_CONFIG) Object.assign(CONFIG, window.APP_CONFIG);

    let watchlist = CONFIG.trackedSymbols;
    let selectedSymbol = CONFIG.defaultSymbol;
    let quotes = {};
    let searchTimer;

    const getEl = (id) => document.getElementById(id);

    document.addEventListener("DOMContentLoaded", () => {
       
        const watchlistBox = getEl("watchlist");
        const selectedSymbolBox = getEl("selected-symbol");
        const selectedNameBox = getEl("selected-name");
        const selectedPriceBox = getEl("selected-price");
        const selectedChangeBox = getEl("selected-change");
        
        const symbolSearch = getEl("symbol-search");
        const searchResults = getEl("search-results");
        
        const strategyRisk = getEl("strategy-risk");
        const strategyHorizon = getEl("strategy-horizon");
        const strategyTrigger = getEl("strategy-trigger");
        
        const chatLog = getEl("chat-log");
        const chatForm = getEl("chat-form");
        const v = chatForm;
        const chatInput = getEl("chat-input");

        const formatQuote = (price, change) => {
            const priceStr = `$${(price || 0).toFixed(2)}`;
            if (change === undefined) return priceStr;
            const sign = change >= 0 ? "+" : "";
            return `${priceStr} (${sign}${change.toFixed(2)}%)`;
        };

        const getStockName = (symbol) => {
            const names = {
                "AAPL": "Apple Inc.",
                "GOOGL": "Alphabet Inc.",
                "NVDA": "NVIDIA Corp.",
                "TSLA": "Tesla, Inc.",
                "MSFT": "Microsoft Corp.",
                "BA": "Boeing Co."
            };
            return names[symbol] || symbol;
        };

        const updateSelectedUI = () => {
            const q = quotes[selectedSymbol];
            if (!selectedSymbolBox) return;

            selectedSymbolBox.textContent = selectedSymbol;
            selectedNameBox.textContent = getStockName(selectedSymbol);

            if (q) {
                selectedPriceBox.textContent = `$${q.price.toFixed(2)}`;
                selectedPriceBox.classList.remove("skeleton");
                
                selectedChangeBox.textContent = `${q.changePercent >= 0 ? "+" : ""}${q.changePercent.toFixed(2)}% today`;
                selectedChangeBox.className = `selected-change ${q.changePercent >= 0 ? "is-up" : "is-down"}`;
                selectedChangeBox.classList.remove("skeleton");
            } else {
                selectedPriceBox.textContent = "Loading...";
                selectedPriceBox.classList.add("skeleton");
                selectedChangeBox.textContent = "Loading...";
                selectedChangeBox.classList.add("skeleton");
            }
        };

        const updateWatchlistUI = () => {
            if (!watchlistBox) return;
            let html = "";

            watchlist.forEach(symbol => {
                const q = quotes[symbol];
                const priceDisplay = q ? `$${q.price.toFixed(2)}` : '<span class="skeleton">00.00</span>';
                const changeDisplay = q ? `${q.changePercent >= 0 ? "+" : ""}${q.changePercent.toFixed(2)}%` : '<span class="skeleton">0.00%</span>';
                const statusClass = q ? (q.changePercent >= 0 ? "is-up" : "is-down") : "";

                html += `
                    <button class="watch-row ${symbol === selectedSymbol ? "is-active" : ""}" onclick="window.pickStock('${symbol}')">
                        <span>
                            <span class="watch-symbol">${symbol}</span>
                            <span class="watch-name">${getStockName(symbol)}</span>
                        </span>
                        <span class="watch-quote">
                            <strong>${priceDisplay}</strong>
                            <span class="watch-change ${statusClass}">${changeDisplay}</span>
                        </span>
                        <span class="watch-remove-btn" onclick="window.removeStock(event, '${symbol}')">×</span>
                    </button>`;
            });
            watchlistBox.innerHTML = html;
        };

        const updateGuideUI = () => {
            const q = quotes[selectedSymbol];
            getEl("guide-focus").textContent = selectedSymbol;
            getEl("guide-quote").textContent = q ? formatQuote(q.price, q.changePercent) : "Loading...";
            getEl("guide-plan").textContent = `${strategyRisk.value} / ${strategyHorizon.value}`;
            getEl("guide-note").textContent = strategyTrigger.value;
        };

        const addChatMessage = (text, role) => {
            const msg = document.createElement("div");
            msg.className = `chat-message ${role}`;
            msg.textContent = text;
            chatLog.appendChild(msg);
            chatLog.scrollTop = chatLog.scrollHeight;
        };

        const handleChatSubmission = (text) => {
            const typingIndicator = getEl("ai-typing");
            addChatMessage(text, "user");
            if (typingIndicator) typingIndicator.classList.add("active");

            const q = quotes[selectedSymbol];
            const marketContext = q ? ` (Price: $${q.price.toFixed(2)}, Change: ${q.changePercent.toFixed(2)}%)` : "";
            
            const systemPrompt = "You are a concise stock trading coach for beginners.";
            const userPrompt = `Stock: ${selectedSymbol}${marketContext}. Strategy: ${strategyRisk.value}. User says: ${text}`;

            fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${CONFIG.geminiApiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: systemPrompt }] },
                    contents: [{ parts: [{ text: userPrompt }] }]
                })
            })
            .then(res => res.json())
            .then(data => {
                if (typingIndicator) typingIndicator.classList.remove("active");
                const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Error: AI response unavailable.";
                addChatMessage(responseText, "assistant");
            })
            .catch(() => {
                if (typingIndicator) typingIndicator.classList.remove("active");
                addChatMessage("Error: Connection to AI coach failed.", "assistant");
            });
        };

        const fetchQuote = (symbol) => {
            fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${CONFIG.marketApiKey}`)
                .then(res => res.json())
                .then(data => {
                    const q = data["Global Quote"];
                    if (q && q["05. price"]) {
                        quotes[symbol] = {
                            price: parseFloat(q["05. price"]),
                            changePercent: parseFloat(q["10. change percent"].replace("%", ""))
                        };
                        updateWatchlistUI();
                        if (symbol === selectedSymbol) {
                            updateSelectedUI();
                            updateGuideUI();
                        }
                    }
                });
        };

        const refreshData = () => {
            const symbolsToFetch = [...new Set([...watchlist, selectedSymbol])];
            symbolsToFetch.forEach(fetchQuote);
        };

        getEl("guide-summary").innerHTML = `
            <div class="summary-item"><strong>Focus</strong><span id="guide-focus">--</span></div>
            <div class="summary-item"><strong>Quote</strong><span id="guide-quote">--</span></div>
            <div class="summary-item"><strong>Plan</strong><span id="guide-plan">--</span></div>
            <div class="summary-item"><strong>Note</strong><span id="guide-note">--</span></div>`;

        updateSelectedUI();
        updateWatchlistUI();
        updateGuideUI();
        refreshData();
        setInterval(refreshData, CONFIG.autoRefreshSeconds * 1000);

        symbolSearch.oninput = () => {
            clearTimeout(searchTimer);
            const query = symbolSearch.value.trim();
            if (!query) return searchResults.classList.remove("is-open");

            searchTimer = setTimeout(() => {
                searchResults.innerHTML = '<div class="search-result">Searching...</div>';
                searchResults.classList.add("is-open");

                fetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=${CONFIG.marketApiKey}`)
                    .then(res => res.json())
                    .then(data => {
                        let html = "";
                        (data.bestMatches || []).forEach(match => {
                            const sym = match["1. symbol"];
                            const name = match["2. name"];
                            html += `
                                <button class="search-result" type="button" onclick="window.addFromDropdown('${sym}', '${name.replace(/'/g, "\\'")}')">
                                    <strong>${sym}</strong>
                                    <span>${name}</span>
                                </button>`;
                        });
                        searchResults.innerHTML = html || '<div class="search-result">No results found</div>';
                    });
            }, 500);
        };

        document.onclick = (e) => {
            if (searchResults && !searchResults.contains(e.target) && e.target !== symbolSearch) {
                searchResults.classList.remove("is-open");
            }
        };

        v.onsubmit = (e) => {
            e.preventDefault();
            const text = chatInput.value.trim();
            if (text) {
                chatInput.value = "";
                handleChatSubmission(text);
            }
        };

        [strategyRisk, strategyHorizon].forEach(el => el.onchange = updateGuideUI);
        strategyTrigger.oninput = updateGuideUI;

        getEl("strategy-ai-btn").onclick = () => handleChatSubmission("Review my strategy plan.");
        document.querySelectorAll(".prompt-chips button").forEach(btn => {
            btn.onclick = () => handleChatSubmission(btn.dataset.prompt);
        });
        
        window.addFromDropdown = (symbol, name) => {
            symbolSearch.value = "";
            searchResults.classList.remove("is-open");
            selectedSymbol = symbol;
            if (!watchlist.includes(symbol)) {
                watchlist.unshift(symbol);
                if (watchlist.length > 8) watchlist.length = 8;
            }
            updateSelectedUI();
            updateWatchlistUI();
            updateGuideUI();
            fetchQuote(symbol);
        };

        window.removeStock = (e, symbol) => {
            e.stopPropagation();
            watchlist = watchlist.filter(s => s !== symbol);
            updateWatchlistUI();
        };

        window.pickStock = (symbol) => {
            selectedSymbol = symbol.toUpperCase();
            updateSelectedUI();
            updateWatchlistUI();
            updateGuideUI();
            fetchQuote(selectedSymbol);
        };

    });
})();
