import { API_BASE_URL } from "$lib/config/api";

export function getFullImageUrl(url: string) {
    if (!url) return "";
    
    const isExternalUrl = url.startsWith("http") || url.startsWith("www");
    return isExternalUrl ? url : `${API_BASE_URL}${url}`;
}

export default getFullImageUrl;
