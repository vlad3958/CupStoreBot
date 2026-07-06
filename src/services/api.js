const API_URL = "https://cupstoreserver.onrender.com";

export async function login(initData) {

    const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            initData,
        }),
    });

    if (!response.ok) {
        throw response;
    }

    return await response.json();
}

export async function getProductions(initData) {

    const response = await fetch(`${API_URL}/api/production/list`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            initData,
        }),
    });

    if (!response.ok) {
        throw response;
    }

    return await response.json();
}

export async function addProduction(
    initData,
    cupsCount,
    cupSize,
    cupType
) {

    const response = await fetch(`${API_URL}/api/production`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            initData,
            cupsCount,
            cupSize,
            cupType,
            date: new Date(),
        }),
    });

    if (!response.ok) {
        throw response;
    }

    return await response.json();
}

export async function updateProduction(
    initData,
    id,
    cupsCount,
    cupSize,
    cupType,
    date
) {

    const response = await fetch(`${API_URL}/api/production/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            initData,
            cupsCount,
            cupSize,
            cupType,
            date,
        }),
    });

    if (!response.ok) {
        throw response;
    }

    return await response.json();
}