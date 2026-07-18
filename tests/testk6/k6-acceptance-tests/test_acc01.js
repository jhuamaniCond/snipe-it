import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, API_TOKEN, THRESHOLDS } from './config.js';
import { uniqueTag, authHeaders, extractId, isSuccess, apiUrl } from './helpers.js';

export const options = {
    vus: 1,
    iterations: 1,
    thresholds: {
        http_req_duration: ['p(95)<' + THRESHOLDS.API_RESPONSE_TIME],
    },
    tags: { test: 'ACC-01' },
};

export default function () {
    const headers = authHeaders(API_TOKEN);
    const tag = uniqueTag('K6-ACC01');
    let assetId = null;
    let modelId = null;
    let failures = 0;

    const modelsRes = http.get(apiUrl(BASE_URL, 'models?limit=1'), { headers });
    const modelsOk = check(modelsRes, {
        'models endpoint ok': (r) => r.status === 200,
        'models available': (r) => {
            try { return JSON.parse(r.body).rows && JSON.parse(r.body).rows.length > 0; }
            catch (e) { return false; }
        },
    });
    if (modelsOk) {
        modelId = JSON.parse(modelsRes.body).rows[0].id;
    } else {
        failures++;
    }

    if (modelId) {
        const payload = JSON.stringify({
            asset_tag: tag,
            model_id: modelId,
            status_id: 1,
            name: 'Activo K6 ACC-01',
            serial: 'SN-' + tag,
            purchase_date: '2026-07-16',
            purchase_cost: 1500.00,
        });
        const createRes = http.post(apiUrl(BASE_URL, 'hardware'), payload, { headers });
        const created = check(createRes, {
            'asset created': (r) => isSuccess(r) && extractId(r) !== null,
        });
        if (created) {
            assetId = extractId(createRes);
        } else {
            failures++;
        }
    }

    if (assetId) {
        const searchRes = http.get(apiUrl(BASE_URL, 'hardware?search=' + tag), { headers });
        const found = check(searchRes, {
            'asset found in list': (r) => {
                try {
                    const body = JSON.parse(r.body);
                    return body.total > 0 && body.rows.some(function(a) { return a.asset_tag === tag; });
                } catch (e) { return false; }
            },
        });
        if (!found) failures++;

        const detailRes = http.get(apiUrl(BASE_URL, 'hardware/' + assetId), { headers });
        const detailOk = check(detailRes, {
            'asset detail matches': (r) => {
                try { return JSON.parse(r.body).asset_tag === tag; }
                catch (e) { return false; }
            },
        });
        if (!detailOk) failures++;
    }

    if (modelId) {
        const noTagPayload = JSON.stringify({
            model_id: modelId, status_id: 1, name: 'Activo sin tag',
        });
        const noTagRes = http.post(apiUrl(BASE_URL, 'hardware'), noTagPayload, { headers });
        const noTagOk = check(noTagRes, {
            'no-tag handled': (r) => r.status === 200 || r.status === 400 || r.status === 422,
        });
        if (!noTagOk) failures++;
    }

    check(failures, { 'ACC-01 passed': function() { return failures === 0; } });
    sleep(1);
}