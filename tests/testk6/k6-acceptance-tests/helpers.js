let _counter = 0;

export function uniqueTag(prefix) {
    _counter++;
    return (prefix || 'K6-ACC') + '-' + Date.now() + '-' + _counter;
}

export function authHeaders(token) {
    return {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
    };
}

export function noAuthHeaders() {
    return {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };
}

export function extractId(response) {
    try {
        const body = JSON.parse(response.body);
        if (body.payload && body.payload.id) return body.payload.id;
        if (body.id) return body.id;
        if (body.data && body.data.id) return body.data.id;
    } catch (e) {}
    return null;
}

export function isSuccess(response) {
    return response.status === 200 || response.status === 201;
}

export function apiUrl(baseUrl, endpoint) {
    const cleanBase = baseUrl.replace(/\/+$/, '');
    const cleanEndpoint = endpoint.replace(/^\/+/, '');
    return cleanBase + '/api/v1/' + cleanEndpoint;
}

export function pageUrl(baseUrl, path) {
    const cleanBase = baseUrl.replace(/\/+$/, '');
    const cleanPath = path.replace(/^\/+/, '');
    return cleanBase + '/' + cleanPath;
}