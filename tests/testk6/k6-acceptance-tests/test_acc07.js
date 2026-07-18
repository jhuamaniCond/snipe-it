import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL, API_TOKEN, THRESHOLDS } from './config.js';
import { authHeaders, apiUrl } from './helpers.js';

export const options = {
    vus: 1,
    iterations: 1,
    thresholds: {
        http_req_duration: ['p(95)<' + THRESHOLDS.API_RESPONSE_TIME],
    },
    tags: { test: 'ACC-07' },
};

export default function () {
    const headers = authHeaders(API_TOKEN);
    let failures = 0;

    const companiesRes = http.get(apiUrl(BASE_URL, 'companies?limit=10'), { headers });
    const companiesOk = check(companiesRes, {
        'companies endpoint ok': (r) => r.status === 200,
    });

    let companies = [];
    if (companiesOk) {
        companies = JSON.parse(companiesRes.body).rows || [];
    } else {
        failures++;
    }

    if (companies.length >= 2) {
        const c1 = companies[0];
        const c2 = companies[1];

        const usersC1 = http.get(apiUrl(BASE_URL, 'users?company_id=' + c1.id + '&limit=5'), { headers });
        const usersC2 = http.get(apiUrl(BASE_URL, 'users?company_id=' + c2.id + '&limit=5'), { headers });

        const usersOk = check(null, {
            'users by company accessible': function() {
                return usersC1.status === 200 && usersC2.status === 200;
            },
        });
        if (!usersOk) failures++;

        const assetsC1 = http.get(apiUrl(BASE_URL, 'hardware?company_id=' + c1.id + '&limit=5'), { headers });
        const assetsC2 = http.get(apiUrl(BASE_URL, 'hardware?company_id=' + c2.id + '&limit=5'), { headers });

        const allAssets = http.get(apiUrl(BASE_URL, 'hardware?limit=100'), { headers });
        if (allAssets.status === 200 && assetsC1.status === 200) {
            const totalAll = JSON.parse(allAssets.body).total || 0;
            const totalC1 = JSON.parse(assetsC1.body).total || 0;
            if (totalAll > 0 && totalC1 > totalAll) failures++;
        }
    }

    check(failures, { 'ACC-07 passed': function() { return failures === 0; } });
}