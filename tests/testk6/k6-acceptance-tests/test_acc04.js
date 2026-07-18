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
    tags: { test: 'ACC-04' },
};

export default function () {
    const headers = authHeaders(API_TOKEN);
    let failures = 0;
    let licenseId = null;
    const TOTAL_SEATS = 3;

    const categoriesRes = http.get(apiUrl(BASE_URL, 'categories?limit=20'), { headers });
    const manufacturersRes = http.get(apiUrl(BASE_URL, 'manufacturers?limit=1'), { headers });
    let categoryId = null;
    let manufacturerId = null;

    if (categoriesRes.status === 200) {
        const cats = JSON.parse(categoriesRes.body).rows || [];
        const licenseCat = cats.find(function(c) { return c.category_type === 'license'; });
        categoryId = licenseCat ? licenseCat.id : (cats[0] ? cats[0].id : null);
    }
    if (manufacturersRes.status === 200) {
        const man = JSON.parse(manufacturersRes.body).rows || [];
        manufacturerId = man[0] ? man[0].id : null;
    }
    if (!categoryId) failures++;

    if (categoryId) {
        const name = 'Licencia K6 ACC-04 ' + Date.now();
        const payload = JSON.stringify({
            name: name, license_name: 'Software K6', license_email: 'k6@test.com',
            seats: TOTAL_SEATS, category_id: categoryId, manufacturer_id: manufacturerId,
            purchase_date: '2026-07-16', purchase_cost: 500.00,
        });
        const createRes = http.post(apiUrl(BASE_URL, 'licenses'), payload, { headers });
        const created = check(createRes, {
            'license created': (r) => isSuccess(r) && extractId(r) !== null,
        });
        if (created) licenseId = extractId(createRes);
        else failures++;
    }

    if (licenseId) {
        const detailRes = http.get(apiUrl(BASE_URL, 'licenses/' + licenseId), { headers });
        const detailOk = check(detailRes, {
            'seats count matches': (r) => {
                try { return JSON.parse(r.body).seats == TOTAL_SEATS; }
                catch (e) { return false; }
            },
        });
        if (!detailOk) failures++;
    }

    const usersRes = http.get(apiUrl(BASE_URL, 'users?limit=5'), { headers });
    let users = [];
    if (usersRes.status === 200) users = JSON.parse(usersRes.body).rows || [];
    if (users.length === 0) failures++;

    if (licenseId && users.length > 0) {
        for (let i = 0; i < Math.min(TOTAL_SEATS, users.length); i++) {
            const p = JSON.stringify({ assigned_user: users[i].id, note: 'Asiento ' + (i + 1) });
            http.post(apiUrl(BASE_URL, 'licenses/' + licenseId + '/checkout'), p, { headers });
        }
        const finalRes = http.get(apiUrl(BASE_URL, 'licenses/' + licenseId), { headers });
        if (finalRes.status === 200) {
            const assignedSeats = JSON.parse(finalRes.body).assigned_seats || 0;
            if (assignedSeats > TOTAL_SEATS) failures++;
        }
    }

    if (licenseId && users.length > TOTAL_SEATS) {
        const p = JSON.stringify({ assigned_user: users[TOTAL_SEATS].id, note: 'Overflow' });
        const overflowRes = http.post(apiUrl(BASE_URL, 'licenses/' + licenseId + '/checkout'), p, { headers });
        const rejected = check(overflowRes, {
            'overflow rejected': (r) => r.status === 400 || r.status === 403 || r.status === 422,
        });
        if (!rejected && overflowRes.status === 200) failures++;
    }

    check(failures, { 'ACC-04 passed': function() { return failures === 0; } });
    sleep(1);
}