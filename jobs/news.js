const {
  Worker,
  isMainThread,
  workerData,
  parentPort,
} = require("node:worker_threads");
const { news_fetcher } = require("../tasks");
const logger = require("../libs/logger").winstonLogger;

// registering all tasks
// worker.register("tasks.news_fetcher", tasks.news_fetcher);

// starts all workers
// worker.start();

// function createWorker() {
//     return new Promise(function (resolve, reject) {
//         const worker = new Worker("./thread_workers.js", {
//             workerData: { thread_count: THREAD_COUNT },
//         });
//         worker.on("message", (data) => {
//             resolve(data);
//         });
//         worker.on("error", (msg) => {
//             reject(`An error ocurred: ${msg}`);
//         });
//     });
// }
// if (isMainThread) {
//   const data = 'some data';
//   const worker = new Worker(import.meta.filename, { workerData: data });
//   worker.on('message', msg => console.log('Reply from Thread:', msg));
// }
// else {
//   // do CPU intensive tasks
//   const source = workerData; // data sent from main thread
//   parentPort.postMessage(btoa(source.toUpperCase()));
// }

(async () => {
  logger.debug("[Worker Thread]: Fetching news");

  // let result = await news_fetcher();

  const page = 0;

  // self.addEventListener('message', (event) => {
  //     const receivedData = event.data;
  //     page = receivedData.page;
  //     logger.debug("[Worker Thread]: data received" + receivedData);
  // });

  const headers = new Headers();
  headers.set("User-Agent", "");

  const NEWS_URLS = [
    "https://www.pngx.com.pg/wp-json/wp/v2/posts",
    "https://www.postcourier.com.pg/wp-json/wp/v2/posts",
    "https://www.thenational.com.pg/wp-json/wp/v2/posts",
  ];
  const news_posts = [];

  const jsons = await Promise.all(
    NEWS_URLS.map(async (url) => {
      if (page) {
        url += "?page=" + page;
      }
      const r = await fetch(url, {
        method: "GET",
        mode: "cors",
      });
      return await r.json();
    })
  );

  jsons
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .forEach((json) => news_posts.push(...json));

  const updated = news_posts.map((news) => {
    const source = news.guid.rendered.split("?")[0];

    return {
      id: news.id,
      date: news.date,
      source: source,
      link: news.link,
      title: news.title.rendered,
      content: news.content.rendered,
      excerpt: news.excerpt.rendered,
      image: news?.jetpack_featured_media_url || "", // ?? `${source}wp-json/wp/v2/media/${news.id}`,
    };
  });

  parentPort.postMessage(updated);
})();
