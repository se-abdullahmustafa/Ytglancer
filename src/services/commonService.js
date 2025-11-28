function getTimestamp() {
    const now = new Date();
    return now.toISOString()
        .replace(/[-:T.]/g, '')
        .slice(0, 14);
}
export const CommonService = {
    getTimestamp
}