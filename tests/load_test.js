// k6 run --out csv=my_test_result.csv tests/load_test.js

import { Trend } from 'k6/metrics';
import http from 'k6/http';
import { check, sleep, group } from 'k6';

let myTrend = new Trend('my_trend');

// export let options = {
//     duration : '1m',
//     vus : 50,
// };

export let options = {
    stages: [
        { duration: '2m', target: 100 },  // Ramp up to 100 users
        { duration: '5m', target: 100 },  // Stay at 100 users
        { duration: '2m', target: 0 },    // Ramp down to 0 users
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
        http_req_failed: ['rate<0.01'],   // Less than 1% failures
        'my_trend': ['avg<200'], // Custom threshold for the custom metric
    }
};

export default function () {
    const responses = {
        // stocks: http.get('http://localhost:5000/api/v2/stocks'),
        // companies: http.get('http://localhost:5000/api/v2/companies'),
        // notifications: http.get('http://localhost:5000/api/v2/notifications'),
        news: http.get('http://localhost:5000/api/v2/news')
    };

    // Check each endpoint individually
    // check(responses.companies, {
    //     'companies endpoint status 200': (r) => r.status === 200,
    //     'companies endpoint < 500ms': (r) => r.timings.duration < 500,
    // });

    // check(responses.stocks, {
    //     'stocks endpoint status 200': (r) => r.status === 200,
    //     'stocks endpoint < 500ms': (r) => r.timings.duration < 500,
    // });

    // check(responses.notifications, {
    //     'notifications endpoint status 200': (r) => r.status === 200,
    //     'notifications endpoint < 500ms': (r) => r.timings.duration < 500,
    // });

    check(responses.news, {
        'news endpoint status is 200': (r) => r.status === 200,
        'news endpoint < 500ms': (r) => r.timings.duration < 500,
    });
    myTrend.add(responses.news.timings.duration);

    // group('Public endpoints', function () {
    //     let res = http.get('https://test.k6.io/public/crocodiles/1/');
    //     check(res, { 'status is 200': (r) => r.status === 200 });
    //     sleep(1);

    //     res = http.get('https://test.k6.io/public/crocodiles/');
    //     check(res, { 'status is 200': (r) => r.status === 200 });
    //     sleep(1);
    // });

    // group('Private endpoints', function () {
    //     let loginRes = http.post('https://test.k6.io/auth/token/login/', {
    //         username: 'test',
    //         password: 'test',
    //     });

    //     check(loginRes, { 'login status is 200': (r) => r.status === 200 });

    //     let authHeaders = {
    //         headers: {
    //             Authorization: `Bearer ${loginRes.json('access')}`,
    //         },
    //     };

    //     let res = http.get('https://test.k6.io/my/crocodiles/', authHeaders);
    //     check(res, { 'status is 200': (r) => r.status === 200 });
    //     sleep(1);
    // });

    sleep(1);
}