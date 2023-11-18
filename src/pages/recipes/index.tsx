/* Blog that calls out to Notion API */
/* Get static props should retrieve a table from Notion, and then it should be rendered as a simple list of blog posts. */

import type { GetStaticProps } from 'next'
import { type Post, cachedGetAllPosts } from '~/utils/notion'
import PostList from '~/components/post_list'

export const getStaticProps: GetStaticProps = async () => {
    const posts = await cachedGetAllPosts()
    return {
        props: {
            posts
        },
        revalidate: 5
    }
}
export default function Blog({ posts }: { posts: Post[] }) {
    return (
        <div>
            <h1>Recipes</h1>
            <PostList posts={posts.filter(post => post.tags.includes("recipes") && !post.tags.includes("hidden"))} slug='recipes' />
        </div>
    )
}