import { env } from '../env.mjs';
import { Client } from '@notionhq/client';
import fs from "fs";
import { join } from "path";

/* Modify this if you end up modifying the schema of your Notion database */
export type Post = {
    id: string; // Notion ID - used to render the blog post later
    slug: string; // URL slug
    title: string;
    byline: string | null;
    date: string;
    tags: string[];
    published: boolean;
}

type Result = {
    id: string;
    properties: {
        Slug: {
            rich_text: {
                plain_text: string;
            }[];
        };
        Page: {
            title: {
                plain_text: string;
                type: string;
                mention: {
                    type: string;
                    page: {
                        id: string;
                    };
                };
            }[];
        };
        Byline: {
            rich_text: {
                plain_text: string;
            }[];
        };
        Date: {
            date: {
                start: string;
            };
        };
        Tags: {
            multi_select: {
                name: string;
            }[];
        };
        Published: {
            checkbox: boolean;
        };
    };
}

function resultToPost(result: Result): Post | null {
    let id = result.id;
    const title = result.properties.Page.title[0]?.plain_text;

    if (!id || !title) {
        console.error("Invalid post: ", result)
        return null;
    }

    // If the Page is a mention, use the mention's id instead
    if (result.properties.Page.title[0]?.type === "mention" && result.properties.Page.title[0]?.mention?.type === "page") {
        id = result.properties.Page.title[0]?.mention?.page?.id;
    }

    // If a slug isn't defined, we'll generate one from the title
    const slug = result.properties.Slug.rich_text[0]?.plain_text || title.toLowerCase().replace(/\s/g, "-");

    // If a byline isn't defined, we'll use the author's name, it can be nil
    const byline = result.properties.Byline.rich_text[0]?.plain_text || null;

    return {
        id: id,
        slug: slug,
        title: title,
        byline: byline,
        date: result.properties.Date.date.start,
        tags: result.properties.Tags.multi_select.map((tag) => tag.name),
        published: result.properties.Published.checkbox,
    }
}

export async function getAllPosts(): Promise<Post[]> {
    const notion = new Client({
        auth: env.NOTION_SECRET,
    });
    
    /*
    TODO: Figure out cursor logic once you have more than 100 posts :D

    const posts = []
    let cursor = undefined;
    while cursor !== null {
        const response = await notion.databases.query({
            database_id: env.NOTION_DATABASE_ID,
            start_cursor: cursor,
        }).catch((err) => {
            console.error(err);
            return [];
        posts.push(...(response.results as unknown as Result[]).map(resultToPost));

        */
    const posts = await notion.databases.query({
        database_id: env.NOTION_DATABASE_ID,
    }).then((response) => {
        console.log(JSON.stringify(response));
        return (response.results as unknown as Result[]).map(resultToPost);
    }).catch((err) => {
        console.error(err);
        return [];
    });

    return (posts.filter((post) => post !== null) as Post[]).filter((post) => post.published);
}

class AsyncLock {
    disable: () => void;
    promise: Promise<void>;

    constructor () {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        this.disable = () => {}
        this.promise = Promise.resolve()
    }

    enable () {
        this.promise = new Promise(resolve => this.disable = resolve)
    }
}

const lock = new AsyncLock()
const CACHE_TTL = 30; // 30 seconds

export async function cachedGetAllPosts(): Promise<Post[]> {
    const path = join(process.cwd(), ".cache");

    console.log("Trying to get cached all posts.... locking..")

    lock.enable();
    console.log("Lock acquired!")

    if (fs.existsSync(path)){
        const { mtime } = fs.statSync(path);

        if (Date.now() - mtime.getTime() < CACHE_TTL * 1000) {
            console.log("Cache hit!");
            lock.disable();
            return JSON.parse(fs.readFileSync(path, "utf8")) as Post[];
        }
    } 

    console.log("Cache miss!");
    const posts = await getAllPosts();
    fs.writeFileSync(path, JSON.stringify(posts));

    lock.disable();

    return posts;
}