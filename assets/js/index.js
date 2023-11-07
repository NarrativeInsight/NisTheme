
'use strict'

import axios from 'axios';
import lunr from 'lunr';

window.SearchApp = {
    searchField: document.getElementById("searchField"),
    searchButton: document.getElementById("searchButton"),
    allWords: document.getElementById("allWords"),
    output: document.getElementById("output"),
    searchData: {},
    searchIndex: {}
};

axios
    .get('/search/index.json')
    .then(response => {
        SearchApp.searchData = response.data;
        SearchApp.searchIndex = lunr(function () {
            this.pipeline.remove(lunr.stemmer);
            this.searchPipeline.remove(lunr.stemmer);
            this.ref('href');
            this.field('title');
            this.field('body');
            response.data.results.forEach(e => {
                this.add(e);
            });
        });
    });


SearchApp.searchButton.addEventListener('click', search);
SearchApp.searchField.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        SearchApp.searchButton.click();
    }
});
SearchApp.allWords.addEventListener( 'click', function (e) {
    SearchApp.searchButton.click();
});

function search() {
    let searchText = SearchApp.searchField.value;

    searchText = searchText
        .split(" ")
        .map( word => { return word + "*" })
        .join(" ");

    if (SearchApp.allWords.checked) {
        searchText = searchText
            .split(" ")
            .map( word => { return "+" + word })
            .join(" ");
    }

    let resultList = SearchApp.searchIndex.search(searchText);

    let list = [];
    let results = resultList.map(entry => {
        SearchApp.searchData.results.filter(d => {
            if(entry.ref == d.href) {
                list.push(d);
            }
        })
    });

    display(list);

}

function display(list) {

    SearchApp.output.innerText = '';
    if (list.length > 0) {
        const ul = document.createElement("ul");
        list.forEach(el => {
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.href = el.href;
            a.text = el.title;
            li.appendChild(a);
            ul.appendChild(li);
        });

        SearchApp.output.appendChild(ul);

    } else {
        SearchApp.output.innerText = "Nothing found";
    }

};
