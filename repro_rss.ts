
import { fetchAndParseFeed } from "./lib/rss/parser";

async function test() {
    const urls = [
        "https://feeds.feedburner.com/TechCrunch/",
        "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml"
    ];

    for (const url of urls) {
        console.log(`Testing ${url}...`);
        try {
            const result = await fetchAndParseFeed(url, "test-id");
            console.log(`Found ${result.articles.length} articles.`);
            if (result.articles.length > 0) {
                const first = result.articles[0];
                console.log("First article title:", first.title);
                console.log("First article content length:", first.content?.length);
                console.log("First article summary length:", first.summary?.length);
            }
        } catch (e) {
            console.error(`Error fetching ${url}:`, e);
        }
        console.log("---");
    }
}

test();
