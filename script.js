<style>
#labelSearchWidget {
    font-family: var(--body-font);
    color: var(--text-font-color);
    background-color: var(--main-post-bg);
    padding: 20px;
    border-radius: 10px;
    max-width: 500px;
    margin: 0 auto 20px; /* 상단 여백 제거, 하단 여백만 유지 */
    font-size: 11px;
    position: relative;
}

#searchBar {
    width: 100%;
    padding: 8px;
    margin-bottom: 10px;
    border: 1px solid #4b4b4b;
    border-radius: 5px;
    font-size: 14px;
    background-color: #4b4b4b;
    color: #cccccc;
    box-sizing: border-box;
}

#searchButton {
    width: 100%;
    background-color: #000000;
    color: var(--button-text-color);
    border: none;
    padding: 8px 16px;
    border-radius: 5px;
    cursor: pointer;
    transition: all .30s ease;
    font-family: var(--body-font);
    font-size: 12px;
    margin-bottom: 15px;
    box-sizing: border-box;
}

#searchButton:hover {
    background-color: var(--label-bg-hover);
}

#labelSuggestions {
    display: none;
    position: absolute;
    background-color: #4b4b4b;
    border: 1px solid #4b4b4b;
    max-height: 150px;
    overflow-y: auto;
    z-index: 1000;
    width: calc(100% - 40px);
    top: 48px;
    left: 20px;
    border-radius: 0 0 5px 5px;
    box-sizing: border-box;
}

#labelSuggestions div {
    padding: 5px 10px;
    cursor: pointer;
    color: #cccccc;
}

#labelSuggestions div:hover, #labelSuggestions div.selected {
    background-color: var(--label-bg-hover);
}

#selectedLabels {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 15px;
}

#selectedLabels span {
    background-color: var(--white-label-color);
    color: var(--text-font-color);
    padding: 2px 10px;
    border-radius: 5px;
    cursor: pointer;
}

#labelSuggestions::-webkit-scrollbar {
    width: 8px;
}

#labelSuggestions::-webkit-scrollbar-track {
    background: #4b4b4b;
}

#labelSuggestions::-webkit-scrollbar-thumb {
    background-color: #cccccc;
    border-radius: 4px;
}
</style>

<div id="labelSearchWidget">
    <input type="text" id="searchBar" placeholder="goong" autocomplete="off" />
    <div id="labelSuggestions"></div>
    <button id="searchButton" onclick="searchPosts()">Search</button>
    <div id="selectedLabels"></div>
</div>

<script>
let allLabels = [];
let selectedIndex = -1;

function fetchLabels() {
    var script = document.createElement('script');
    script.src = '/feeds/posts/summary?alt=json-in-script&callback=processLabels&max-results=0';
    document.body.appendChild(script);
}

function processLabels(json) {
    if (json.feed && json.feed.category) {
        allLabels = json.feed.category.map(cat => cat.term);
        allLabels = [...new Set(allLabels)];
    }
    setupSearchBar();
}

function setupSearchBar() {
    const searchBar = document.getElementById('searchBar');
    const suggestions = document.getElementById('labelSuggestions');

    searchBar.addEventListener('input', function() {
        const input = this.value.toLowerCase();
        if (input.length > 0) {
            const matchedLabels = allLabels.filter(label => 
                label.toLowerCase().includes(input)
            );
            displaySuggestions(matchedLabels);
        } else {
            suggestions.style.display = 'none';
        }
        selectedIndex = -1;
    });

    searchBar.addEventListener('keydown', function(e) {
        const suggestions = document.getElementById('labelSuggestions');
        const items = suggestions.getElementsByTagName('div');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = (selectedIndex < items.length - 1) ? selectedIndex + 1 : 0;
            updateSelection(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = (selectedIndex > 0) ? selectedIndex - 1 : items.length - 1;
            updateSelection(items);
        } else if (e.key === 'Enter' && selectedIndex > -1) {
            e.preventDefault();
            items[selectedIndex].click();
        }
    });

    document.addEventListener('click', function(e) {
        if (e.target !== searchBar && !suggestions.contains(e.target)) {
            suggestions.style.display = 'none';
        }
    });
}

function updateSelection(items) {
    Array.from(items).forEach((item, index) => {
        if (index === selectedIndex) {
            item.classList.add('selected');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('selected');
        }
    });
}

function displaySuggestions(labels) {
    const suggestions = document.getElementById('labelSuggestions');
    suggestions.innerHTML = '';
    if (labels.length > 0) {
        suggestions.style.display = 'block';
        labels.forEach(label => {
            const div = document.createElement('div');
            div.textContent = label;
            div.onclick = function() { addLabel(label); };
            suggestions.appendChild(div);
        });
    } else {
        suggestions.style.display = 'none';
    }
}

function addLabel(label) {
    const selectedLabels = document.getElementById('selectedLabels');
    if (!Array.from(selectedLabels.children).some(span => span.textContent === label)) {
        const span = document.createElement('span');
        span.textContent = label;
        span.onclick = function() { this.remove(); };
        selectedLabels.appendChild(span);
    }
    document.getElementById('searchBar').value = '';
    document.getElementById('labelSuggestions').style.display = 'none';
}

function searchPosts() {
    const selected = document.getElementById('selectedLabels');
    const labels = Array.from(selected.children).map(span => span.textContent);
    
    if (labels.length === 0) {
        alert('라벨을 선택해주세요.');
        return;
    }
    
    let searchUrl = '/search?q=';
    labels.forEach((label, index) => {
        searchUrl += 'label:"' + label + '"';
        if (index < labels.length - 1) {
            searchUrl += ' AND ';
        }
    });
    
    window.location.href = searchUrl;
}

fetchLabels();
</script>