# newsapi

Powered by NewsAPI.org

A promise-based node wrapper for the awesome NewsAPI

You will need an API key from [https://newsapi.org](https://newsapi.org)

Please look at their documentation to see how to use the API

If you use this in a project, add a 'powered by' attribution link back to NewsAPI.org.

```js
let NewsAPI = require('newsapi');

let newsapi = new NewsAPI('YOUR_API_KEY');

// To query articles
newsapi.articles({
  source: 'associated-press', // required
  sortBy: 'top' // optional
}).then(articlesResponse => {
  console.log(articlesResponse);
  /*
    {
      status: "ok",
      source: "associated-press",
      sortBy: "top",
      articles: [
        ...
      ]
    }
   */
});

// To query sources
newsapi.sources({
  category: 'technology', // optional
  language: 'en', // optional
  country: 'us' // optional
}).then(sourcesResponse => {
  console.log(sourcesResponse);
  /*
    {
      status: "ok",
      sources: [
        ...
      ]
    }
  */
});
```