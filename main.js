const apiKey = "RVFIMWMC4KB7C7N6";
let stockChart;
let currentSymbol = ""; // Keep track of the currently selected symbol

function convertETtoCET(dateString) {
    // Parse the date string into a Date object (assuming ET)
    const etDate = new Date(dateString + "T00:00:00-05:00"); // Append time and ET timezone offset

    // Add 6 hours to convert to CET (5 hours for ET offset + 1 hour for CET)
    etDate.setHours(etDate.getHours() + 6);

    return etDate;
}

// Function to create/update a chart
function createChart(chartData, symbol) {
    if (stockChart) {
        stockChart.destroy();
    }

    stockChart = new Highcharts.stockChart("stockChart", {
        rangeSelector: {
            selected: 1,
        },

        title: {
            text: `Stock Price of ${symbol}`,
        },

        series: [{
            name: `${symbol} Stock Price`,
            data: chartData, // Directly using the array of [timestamp, price] pairs
            tooltip: {
                valueDecimals: 2,
            },
        }],
    });
}

// this function should fetch all the avalible data for the symbol and display it in the chart

// Function to fetch stock data
async function fetchTimeSeries(symbol, functionType, timeSeriesKey) {
    const url = `https://www.alphavantage.co/query?function=${functionType}&symbol=${symbol}&apikey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    const seriesData = [];
    for (let [date, value] of Object.entries(data[timeSeriesKey])) {
        const cetDate = convertETtoCET(date); // Converting to CET if necessary
        const timestamp = cetDate.getTime();
        const price = parseFloat(value["4. close"]);
        seriesData.push([timestamp, price]);
    }

    return seriesData;
}

async function fetchData(symbol) {
    // Fetch data from multiple time series
    const dailyData = await fetchTimeSeries(symbol, "TIME_SERIES_DAILY", "Time Series (Daily)");
    const weeklyData = await fetchTimeSeries(symbol, "TIME_SERIES_WEEKLY", "Weekly Time Series");
    // Add other time series if needed

    // Combine and sort data
    const combinedData = [...dailyData, ...weeklyData];
    combinedData.sort((a, b) => a[0] - b[0]); // Sort by timestamp

    console.log(combinedData);
    return combinedData;
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
async function selectSymbol(symbol) {
    currentSymbol = symbol;
    const chartData = await fetchData(symbol);
    createChart(chartData, symbol);
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

// Update the selectSymbol function in the displaySearchResults to include the default interval
function updateSearchResultsClick() {
    const searchResults = document.getElementById("searchResults").children;
    for (let i = 0; i < searchResults.length; i++) {
        searchResults[i].addEventListener("click", () =>
            selectSymbol(searchResults[i].getAttribute("data-symbol"), "5min")
        );
    }
}
