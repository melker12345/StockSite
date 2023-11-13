const apiKey = "RVFIMWMC4KB7C7N6";
let stockChart;
let currentSymbol = ""; // Keep track of the currently selected symbol

// Function to create/update a chart
function createChart(data, symbol) {
    const ctx = document.getElementById("stockChart").getContext("2d");
    if (stockChart) {
        stockChart.destroy();
    }

    stockChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: `${symbol} Stock Price`,
                    data: data.prices,
                    borderColor: "#0ca8f6",
                },
            ],
        },
        options: {
            scales: {
                x: {
                    ticks: {
                        display: true, // This will remove the labels on the x-axis
                    },
                },
                y: {
                    // y-axis labels
                    beginAtZero: false,
                },
            },
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `Stock Price of ${symbol}: ${currentSymbol} `,
                },
                legend: {
                    display: false, // Assuming you don't want to show the legend
                },
            },
        },
    });
}

// Function to fetch stock data
async function fetchData(symbol, interval) {
    let functionType;
    let timeSeriesKey;

    if (interval === "1wk") {
        functionType = "TIME_SERIES_WEEKLY";
        timeSeriesKey = "Weekly Time Series";
    } else {
        functionType =
            interval === "1d" ? "TIME_SERIES_DAILY" : "TIME_SERIES_INTRADAY";
        timeSeriesKey =
            functionType === "TIME_SERIES_DAILY"
                ? "Time Series (Daily)"
                : `Time Series (${interval})`;
    }
    
    const url = `https://www.alphavantage.co/query?function=${functionType}&symbol=${symbol}${interval !== "1wk" ? `&interval=${interval}` : ''}&apikey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    const labels = [];
    const prices = [];
    for (let [date, value] of Object.entries(data[timeSeriesKey])) {
        labels.unshift(date);
        prices.unshift(value["4. close"]);
    }
    return { labels, prices };
}

// Function to display search results
function displaySearchResults(matches) {
    document.getElementById("searchResults").innerHTML = matches
        .map(
            (match) =>
                `<div onclick="selectSymbol('${match["1. symbol"]}', '5min')">
            ${match["2. name"]} (${match["1. symbol"]})
        </div>`
        )
        .join("");
}

// Function to handle selection of a symbol
async function selectSymbol(symbol, interval = "5min") {
    currentSymbol = symbol; // Update the current symbol
    const data = await fetchData(symbol, interval);
    createChart(data, symbol);
    document.getElementById("searchResults").innerHTML = "";
}

// Event listener for the search input
document
    .getElementById("symbolSearch")
    .addEventListener("input", async (event) => {
        const keyword = event.target.value.trim();
        if (keyword.length >= 3) {
            const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${keyword}&apikey=${apiKey}`;
            const response = await fetch(url);
            const searchData = await response.json();
            displaySearchResults(searchData["bestMatches"] || []);
        }
    });

// Event listeners for buttons
document
    .getElementById("dayBtn")
    .addEventListener("click", () => selectSymbol(currentSymbol, "5min"));
document
    .getElementById("fiveDayBtn")
    .addEventListener("click", () => selectSymbol(currentSymbol, "30min"));
document
    .getElementById("monthBtn")
    .addEventListener("click", () => selectSymbol(currentSymbol, "1d"));
document
    .getElementById("yearBtn")
    .addEventListener("click", () => selectSymbol(currentSymbol, "1d"));
document
    .getElementById("maxBtn")
    .addEventListener("click", () => selectSymbol(currentSymbol, "1wk")); // '1d' can be changed to a different interval if needed

// Update the selectSymbol function in the displaySearchResults to include the default interval
function updateSearchResultsClick() {
    const searchResults = document.getElementById("searchResults").children;
    for (let i = 0; i < searchResults.length; i++) {
        searchResults[i].addEventListener("click", () =>
            selectSymbol(searchResults[i].getAttribute("data-symbol"), "5min")
        );
    }
}
