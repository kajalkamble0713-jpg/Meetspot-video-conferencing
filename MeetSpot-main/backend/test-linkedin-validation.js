import { request as httpsRequest } from "node:https";
import { URL } from "node:url";

const checkUrlReachable = (url, timeoutMs = 5000) => new Promise((resolve) => {
    try {
        const u = new URL(url);
        const req = httpsRequest({
            method: 'GET',
            hostname: u.hostname,
            path: u.pathname + (u.search || ''),
            protocol: u.protocol,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36' }
        }, (res) => {
            const code = res.statusCode || 0;
            
            // Check for explicit 404/410 status codes
            if (code === 404 || code === 410) {
                resolve(false);
                res.resume();
                return;
            }
            
            // LinkedIn redirects invalid profiles to /404/ with 302/301 status
            // Check if redirecting to a 404 page
            if ((code === 301 || code === 302 || code === 307 || code === 308) && res.headers.location) {
                const redirectLocation = res.headers.location.toLowerCase();
                if (redirectLocation.includes('/404') || redirectLocation.includes('/error')) {
                    resolve(false);
                    res.resume();
                    return;
                }
            }
            
            // For LinkedIn specifically, check if final URL is /404/ page
            // LinkedIn returns 200 status but redirects to /404/
            if (u.hostname.includes('linkedin.com') && code === 200) {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk.toString();
                    // Only read first 10KB to check for 404 indicators
                    if (data.length > 10000) {
                        res.destroy();
                    }
                });
                res.on('end', () => {
                    const lowerData = data.toLowerCase();
                    // Check for common 404 page indicators on LinkedIn
                    const is404 = 
                        lowerData.includes('page not found') ||
                        lowerData.includes('this page doesn\'t exist') ||
                        lowerData.includes('the page you requested could not be found') ||
                        (res.req && res.req.path && res.req.path.includes('/404'));
                    console.log(`Status: ${code}, Path: ${res.req.path}, Is404: ${is404}`);
                    resolve(!is404);
                });
                res.on('error', () => resolve(true)); // Assume OK on error
                return;
            }
            
            resolve(true);
            res.resume(); // drain
        });
        // Network errors/timeouts: don't block registration (assume ok)
        req.on('error', () => resolve(true));
        req.setTimeout(timeoutMs, () => { req.destroy(); resolve(true); });
        req.end();
    } catch (e) { resolve(true); }
});

// Test URLs
const testUrls = [
    'https://www.linkedin.com/in/invalid-user-123456789',
    'https://linkedin.com/404/',
    'https://www.linkedin.com/404/',
];

console.log('Testing LinkedIn URL validation...\n');

for (const url of testUrls) {
    checkUrlReachable(url).then(result => {
        console.log(`URL: ${url}`);
        console.log(`Valid: ${result}`);
        console.log(`Should be saved: ${result ? 'YES' : 'NO'}\n`);
    });
}
