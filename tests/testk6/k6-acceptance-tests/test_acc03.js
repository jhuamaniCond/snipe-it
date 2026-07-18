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
    tags: { test: 'ACC-03' },
};

export default function () {
    const headers = authHeaders(API_TOKEN);
    let failures = 0;
    let assetId = null;
    let userId = null;

    const assetsRes = http.get(apiUrl(BASE_URL, 'hardware?limit=50'), { headers });
    if (assetsRes.status === 200) {
        const body = JSON.parse(assetsRes.body);
        const assigned = body.rows ? body.rows.find(function(a) { return a.assigned_to; }) : null;
        if (assigned) {
            assetId = assigned.id;
            userId = assigned.assigned_to ? assigned.assigned_to.id : null;
        }
    }

    if (!assetId) {
        const usersRes = http.get(apiUrl(BASE_URL, 'users?limit=1'), { headers });
        const modelsRes = http.get(apiUrl(BASE_URL, 'models?limit=1'), { headers });
        if (usersRes.status === 200 && modelsRes.status === 200) {
            const users = JSON.parse(usersRes.body).rows;
            const models = JSON.parse(modelsRes.body).rows;
            if (users && users.length > 0 && models && models.length > 0) {
                userId = users[0].id;
                const tag = uniqueTag('K6-ACC03');
                const payload = JSON.stringify({
                    asset_tag: tag, model_id: models[0].id, status_id: 1, name: 'Activo K6 ACC-03',
                });
                const createRes = http.post(apiUrl(BASE_URL, 'hardware'), payload, { headers });
                if (isSuccess(createRes)) {
                    assetId = extractId(createRes);
                    const coPayload = JSON.stringify({
                        checkout_to_type: 'user', assigned_user: userId, note: 'Asignado ACC-03',
                    });
                    http.post(apiUrl(BASE_URL, 'hardware/' + assetId + '/checkout'), coPayload, { headers });
                }
            }
        }
    }
    if (!assetId || !userId) failures++;

    if (assetId && userId) {
        const checkinPayload = JSON.stringify({ note: 'Devuelto por k6 ACC-03' });
        const checkinRes = http.post(apiUrl(BASE_URL, 'hardware/' + assetId + '/checkin'), checkinPayload, { headers });
        const checkinOk = check(checkinRes, {
            'checkin success': (r) => isSuccess(r),
        });
        if (checkinOk) {
            const detailRes = http.get(apiUrl(BASE_URL, 'hardware/' + assetId), { headers });
            const availableOk = check(detailRes, {
                'asset available after checkin': (r) => {
                    try { return JSON.parse(r.body).assigned_to === null; }
                    catch (e) { return false; }
                },
            });
            if (!availableOk) failures++;
        } else {
            failures++;
        }
    }

    const allAssets = http.get(apiUrl(BASE_URL, 'hardware?limit=50'), { headers });
    let unassignedId = null;
    if (allAssets.status === 200) {
        const body = JSON.parse(allAssets.body);
        const unassigned = body.rows ? body.rows.find(function(a) { return !a.assigned_to; }) : null;
        if (unassigned) unassignedId = unassigned.id;
    }
    if (!unassignedId && failures === 0) {
        const modelsRes = http.get(apiUrl(BASE_URL, 'models?limit=1'), { headers });
        if (modelsRes.status === 200) {
            const modelId = JSON.parse(modelsRes.body).rows[0]?.id;
            if (modelId) {
                const tag = uniqueTag('K6-ACC03B');
                const p = JSON.stringify({ asset_tag: tag, model_id: modelId, status_id: 1, name: 'Unassigned' });
                const cr = http.post(apiUrl(BASE_URL, 'hardware'), p, { headers });
                if (isSuccess(cr)) unassignedId = extractId(cr);
            }
        }
    }

    if (unassignedId) {
        const badPayload = JSON.stringify({ note: 'Checkin invalido' });
        const badRes = http.post(apiUrl(BASE_URL, 'hardware/' + unassignedId + '/checkin'), badPayload, { headers });
        const rejected = check(badRes, {
            'unassigned checkin rejected': (r) => r.status === 400 || r.status === 422,
        });
        if (!rejected && badRes.status === 200) failures++;
    }

    check(failures, { 'ACC-03 passed': function() { return failures === 0; } });
    sleep(1);
}