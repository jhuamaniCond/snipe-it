import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, API_TOKEN, THRESHOLDS } from './config.js';
import { authHeaders, extractId, isSuccess, apiUrl } from './helpers.js';

export const options = {
    vus: 1,
    iterations: 1,
    thresholds: {
        http_req_duration: ['p(95)<' + THRESHOLDS.API_RESPONSE_TIME],
    },
    tags: { test: 'ACC-05' },
};

export default function () {
    const headers = authHeaders(API_TOKEN);
    let failures = 0;
    let consumableId = null;
    const INITIAL_STOCK = 3;

    const categoriesRes = http.get(apiUrl(BASE_URL, 'categories?limit=20'), { headers });
    let categoryId = null;
    if (categoriesRes.status === 200) {
        const cats = JSON.parse(categoriesRes.body).rows || [];
        const consCat = cats.find(function(c) { return c.category_type === 'consumable'; });
        categoryId = consCat ? consCat.id : (cats[0] ? cats[0].id : null);
    }
    if (!categoryId) failures++;

    if (categoryId) {
        const name = 'Consumible K6 ' + Date.now();
        const payload = JSON.stringify({
            name: name, qty: INITIAL_STOCK, category_id: categoryId,
            purchase_date: '2026-07-16', purchase_cost: 25.00,
        });
        const createRes = http.post(apiUrl(BASE_URL, 'consumables'), payload, { headers });
        const created = check(createRes, {
            'consumable created': (r) => isSuccess(r) && extractId(r) !== null,
        });
        if (created) consumableId = extractId(createRes);
        else failures++;
    }

    if (consumableId) {
        const detailRes = http.get(apiUrl(BASE_URL, 'consumables/' + consumableId), { headers });
        const stockOk = check(detailRes, {
            'initial stock correct': (r) => {
                try { return JSON.parse(r.body).qty == INITIAL_STOCK; }
                catch (e) { return false; }
            },
        });
        if (!stockOk) failures++;
    }

    const usersRes = http.get(apiUrl(BASE_URL, 'users?limit=1'), { headers });
    let userId = null;
    if (usersRes.status === 200) {
        const users = JSON.parse(usersRes.body).rows || [];
        userId = users[0] ? users[0].id : null;
    }
    if (!userId) failures++;

    if (consumableId && userId) {
        const coPayload = JSON.stringify({ assigned_user: userId, note: 'Entrega k6 ACC-05' });
        const coRes = http.post(apiUrl(BASE_URL, 'consumables/' + consumableId + '/checkout'), coPayload, { headers });
        const coOk = check(coRes, {
            'checkout success': (r) => isSuccess(r),
        });
        if (coOk) {
            const afterRes = http.get(apiUrl(BASE_URL, 'consumables/' + consumableId), { headers });
            if (afterRes.status === 200) {
                const remaining = JSON.parse(afterRes.body).qty || 0;
                if (remaining !== INITIAL_STOCK - 1) failures++;
            }
        } else {
            failures++;
        }

        for (let i = 0; i < INITIAL_STOCK - 1; i++) {
            const p = JSON.stringify({ assigned_user: userId, note: 'Agotamiento ' + (i + 2) });
            http.post(apiUrl(BASE_URL, 'consumables/' + consumableId + '/checkout'), p, { headers });
        }

        const exhaustedRes = http.get(apiUrl(BASE_URL, 'consumables/' + consumableId), { headers });
        if (exhaustedRes.status === 200) {
            const finalStock = JSON.parse(exhaustedRes.body).qty || 0;
            if (finalStock !== 0) failures++;
        }

        const overflowPayload = JSON.stringify({ assigned_user: userId, note: 'Sin stock' });
        const overflowRes = http.post(apiUrl(BASE_URL, 'consumables/' + consumableId + '/checkout'), overflowPayload, { headers });
        const rejected = check(overflowRes, {
            'overflow rejected': (r) => r.status === 400 || r.status === 403 || r.status === 422,
        });
        if (!rejected && overflowRes.status === 200) failures++;
    }

    check(failures, { 'ACC-05 passed': function() { return failures === 0; } });
    sleep(1);
}