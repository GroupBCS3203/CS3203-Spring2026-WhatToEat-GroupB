const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function getAIRecipes(ingredients) {
    const res = await fetch(
        `${BASE_URL}/api/recipes/ai?ingredients=${encodeURIComponent(ingredients)}`
    );

    if (!res.ok) throw new Error("Failed to fetch AI recipes");

    return await res.json();
}

export async function getTopRecipes() {
    const res = await fetch(`${BASE_URL}/api/recipes/top`);
    return await res.json();
}

export async function searchRecipes(ingredients) {
    const res = await fetch(
        `${BASE_URL}/api/recipes/search?ingredients=${encodeURIComponent(ingredients)}`
    );

    return await res.json();
}