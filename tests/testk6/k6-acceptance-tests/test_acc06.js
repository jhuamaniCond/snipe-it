import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL, API_TOKEN, THRESHOLDS } from './config.js';
import { authHeaders, noAuthHeaders, pageUrl, apiUrl } from './helpers.js';

export const options = {
    vus: 1,
    iterations: 1,
    thresholds: {
        http_req_duration: ['p(95)<' + THRESHOLDS.API_RESPONSE_TIME],
    },
    tags: { test: 'ACC-06' },
};

export default function () {
    const headers = authHeaders(API_TOKEN);
    let failures = 0;

    const noAuthRes = http.get(apiUrl(BASE_URL, 'hardware'), { headers: noAuthHeaders() });
    const apiRejected = check(noAuthRes, {
        'api rejects no token': (r) => r.status === 401,
    });
    if (!apiRejected) failures++;

    const pageRes = http.get(pageUrl(BASE_URL, 'hardware'), {
        headers: noAuthHeaders(),
        'redirect': 'manual',
    });
    const webProtected = check(pageRes, {
        'web redirects without session': (r) => r.status === 302 || r.status === 301,
    });
    if (!webProtected && pageRes.status === 200) {
        if (pageRes.body && pageRes.body.indexOf('login') === -1) failures++;
    }

    const badTokenRes = http.get(apiUrl(BASE_URL, 'companies'), {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer token-invalido-xyz-123',
        },
    });
    const badTokenRejected = check(badTokenRes, {
        'api rejects bad token': (r) => r.status === 401,
    });
    if (!badTokenRejected) failures++;

    const loginRes = http.get(pageUrl(BASE_URL, 'login'));
    check(loginRes, {
        'x-frame-options present': (r) => r.headers['X-Frame-Options'] !== undefined,
        'x-content-type-options present': (r) => r.headers['X-Content-Type-Options'] !== undefined,
    });

    const validRes = http.get(apiUrl(BASE_URL, 'companies'), { headers: authHeaders(API_TOKEN) });
    const validOk = check(validRes, {
        'valid token works': (r) => r.status === 200,
    });
    if (!validOk) failures++;

    check(failures, { 'ACC-06 passed': function() { return failures === 0; } });
}