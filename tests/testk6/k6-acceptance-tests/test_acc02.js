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
    tags: { test: 'ACC-02' },
};

export default function () {
    const headers = authHeaders(API_TOKEN);
    let failures = 0;
    let assetId = null;
    let userId = null;

    const usersRes = http.get(apiUrl(BASE_URL, 'users?limit=1'), { headers });
    const usersOk = check(usersRes, {
        'users available': (r) => {
            try { return JSON.parse(r.body).rows && JSON.parse(r.body).rows.length > 0; }
            catch (e) { return false; }
        },
    });
    if (usersOk) {
        userId = JSON.parse(usersRes.body).rows[0].id;
    } else {
        failures++;
    }

    const assetsRes = http.get(apiUrl(BASE_URL, 'hardware?limit=20'), { headers });
    if (assetsRes.status === 200) {
        const body = JSON.parse(assetsRes.body);
        const unassigned = body.rows ? body.rows.find(function(a) { return !a.assigned_to; }) : null;
        if (unassigned) assetId = unassigned.id;
    }

    if (!assetId) {
        const modelsRes = http.get(apiUrl(BASE_URL, 'models?limit=1'), { headers });
        if (modelsRes.status === 200) {
            const modelId = JSON.parse(modelsRes.body).rows[0]?.id;
            if (modelId) {
                const tag = uniqueTag('K6-ACC02');
                const payload = JSON.stringify({
                    asset_tag: tag, model_id: modelId, status_id: 1, name: 'Activo K6 ACC-02',
                });
                const createRes = http.post(apiUrl(BASE_URL, 'hardware'), payload, { headers });
                if (isSuccess(createRes)) assetId = extractId(createRes);
            }
        }
    }
    if (!assetId) failures++;

    if (assetId && userId) {
        const checkoutPayload = JSON.stringify({
            checkout_to_type: 'user',
            assigned_user: userId,
            expected_checkin: '2026-08-15',
            note: 'Asignado por k6 ACC-02',
        });
        const checkoutRes = http.post(apiUrl(BASE_URL, 'hardware/' + assetId + '/checkout'), checkoutPayload, { headers });
        const checkoutOk = check(checkoutRes, {
            'checkout success': (r) => isSuccess(r),
        });
        if (checkoutOk) {
            const detailRes = http.get(apiUrl(BASE_URL, 'hardware/' + assetId), { headers });
            const assignedOk = check(detailRes, {
                'asset shows assigned': (r) => {
                    try { return JSON.parse(r.body).assigned_to !== null; }
                    catch (e) { return false; }
                },
            });
            if (!assignedOk) failures++;
        } else {
            failures++;
        }

        const doublePayload = JSON.stringify({
            checkout_to_type: 'user', assigned_user: userId, note: 'Intento doble checkout',
        });
        const doubleRes = http.post(apiUrl(BASE_URL, 'hardware/' + assetId + '/checkout'), doublePayload, { headers });
        const doubleOk = check(doubleRes, {
            'double checkout rejected': (r) => r.status === 400 || r.status === 422,
        });
        if (!doubleOk && doubleRes.status === 200) failures++;
    }

    check(failures, { 'ACC-02 passed': function() { return failures === 0; } });
    sleep(1);
}