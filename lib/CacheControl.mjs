export const getNextRequestTime = (cacheControlHeader, now) => {
    const cacheControl = cacheControlHeader.match(/max-age=(?<maxAge>\d+)/)
    if(!cacheControl) return now
    return now + (cacheControl.groups.maxAge * 1000)
}
