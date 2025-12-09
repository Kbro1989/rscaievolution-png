
const https = require('https');
const querystring = require('querystring');

const API_ENDPOINT = 'classic.runescape.wiki';
const API_PATH = '/api.php';
const USER_AGENT = 'RSC-Evolution-AI-Verifier/1.0 (contact: user-provided)';

// Cache to prevent spamming the Wiki
const cache = new Map();

/**
 * sleep helper to respect rate limits
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generic Wiki API fetch
 */
function fetchWiki(params) {
    return new Promise((resolve, reject) => {
        const query = querystring.stringify({
            format: 'json',
            ...params
        });

        const options = {
            hostname: API_ENDPOINT,
            path: `${API_PATH}?${query}`,
            method: 'GET',
            headers: {
                'User-Agent': USER_AGENT
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error(`Failed to parse Wiki response: ${e.message}`));
                    }
                } else {
                    reject(new Error(`Wiki API error: ${res.statusCode}`));
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.end();
    });
}

/**
 * Fetch entity specific data (ID, Inspect Text, etc)
 * Uses Semantic MediaWiki or Infobox parsing if needed.
 * For RSC Wiki, standard 'parse' action is usually best to get templates.
 */
async function fetchEntityData(name) {
    if (cache.has(name)) return cache.get(name);

    await sleep(500); // Rate limit: 500ms between requests

    try {
        // First, search for the exact page title to handle case sensitivity/redirects
        const searchData = await fetchWiki({
            action: 'query',
            list: 'search',
            srsearch: name,
            srlimit: 1
        });

        const pageTitle = searchData.query?.search?.[0]?.title;
        if (!pageTitle) {
            console.warn(`[WikiClient] Page not found for: ${name}`);
            return null;
        }

        // Now fetch parse data (properties/templates)
        const parseData = await fetchWiki({
            action: 'parse',
            page: pageTitle,
            prop: 'wikitext'
        });

        const wikitext = parseData.parse?.wikitext?.['*'];
        if (!wikitext) return null;

        // Parse Infobox for ID (very regex heavy, tailored for RSC Wiki)
        // Common format: | id = 123
        const idMatch = wikitext.match(/\|\s*id\s*=\s*(\d+)/i);
        // Common format: | examine = It's a ...
        const examineMatch = wikitext.match(/\|\s*examine\s*=\s*(.+)/i);

        const result = {
            title: pageTitle,
            id: idMatch ? parseInt(idMatch[1]) : null,
            examine: examineMatch ? examineMatch[1].trim() : null
        };

        cache.set(name, result);
        return result;

    } catch (error) {
        console.error(`[WikiClient] Error fetching ${name}:`, error.message);
        return null;
    }
}

module.exports = { fetchEntityData };
