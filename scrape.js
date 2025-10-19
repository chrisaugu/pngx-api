const { Scraper, Root, DownloadContent, OpenLinks, CollectContent } = require('nodejs-web-scraper');
const fs = require('fs');

(async () => {

    const config = {
        baseSiteUrl: `https://www.some-news-site.com/`,
        startUrl: `https://www.some-news-site.com/`,
        filePath: './images/',
        concurrency: 10,//Maximum concurrent jobs. More than 10 is not recommended.Default is 3.
        maxRetries: 3,//The scraper will try to repeat a failed request few times(excluding 404). Default is 5.       
        logPath: './logs/'//Highly recommended: Creates a friendly JSON for each operation object, with all the relevant data. 
    }
    

    const scraper = new Scraper(config);//Create a new Scraper instance, and pass config to it.

    //Now we create the "operations" we need:

    const root = new Root();//The root object fetches the startUrl, and starts the process.  
 
    //Any valid cheerio selector can be passed. For further reference: https://cheerio.js.org/
    const category = new OpenLinks('.category',{name:'category'});//Opens each category page.

    const article = new OpenLinks('article a', {name:'article' });//Opens each article page.

    const image = new DownloadContent('img', { name: 'image' });//Downloads images.

    const title = new CollectContent('h1', { name: 'title' });//"Collects" the text from each H1 element.

    const story = new CollectContent('section.content', { name: 'story' });//"Collects" the the article body.

    root.addOperation(category);//Then we create a scraping "tree":
      category.addOperation(article);
       article.addOperation(image);
       article.addOperation(title);
       article.addOperation(story);

    await scraper.scrape(root);

    const articles = article.getData()//Will return an array of all article objects(from all categories), each
    //containing its "children"(titles,stories and the downloaded image urls) 

    //If you just want to get the stories, do the same with the "story" variable:
    const stories = story.getData();

    fs.writeFile('./articles.json', JSON.stringify(articles), () => { })//Will produce a formatted JSON containing all article pages and their selected data.

    fs.writeFile('./stories.json', JSON.stringify(stories), () => { })
    

})();    