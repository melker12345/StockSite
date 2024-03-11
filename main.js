function toggleFilter() {
    const toggleFilterButton = document.querySelector('.toggleFilter');
    const filterDiv = document.querySelector('.filter');

    toggleFilterButton.addEventListener('click', () => {
        filterDiv.classList.toggle('hidden');
    });
}

async function fetchIndex() {
    const indexList = ['^OMXS30', '^NDX', '^SPX', '^DJSH'];
    const formattedIndexChanges = [];

    for (const index of indexList) {
        try {
            const response = await fetch(`https://financialmodelingprep.com/api/v3/quote/${index}?apikey=1z3Eat6B3MbUU0ayvXDBXEt4D82W1Zmo`);
            const data = await response.json();
            const changesPercentage = data[0].changesPercentage.toFixed(2);

            let formattedChangePercentage = changesPercentage;
            if (changesPercentage > 0) {
                formattedChangePercentage = '+' + changesPercentage;
            }

            formattedIndexChanges.push({ symbol: data[0].symbol.slice(1), change: formattedChangePercentage + '%' });
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    return formattedIndexChanges;
}

async function handleDataFetched(data) {
    const incomeAndMetrics = data;
    // Handle the fetched data
}

function checkTheme() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', currentTheme);
}

async function fetchData() {
    checkTheme();
    const data = await fetchIndex();
    handleDataFetched(data);
}

fetchData();
toggleFilter();