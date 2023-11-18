/* Blog that calls out to Notion API */
/* Get static props should retrieve a table from Notion, and then it should be rendered as a simple list of blog posts. */

import type { GetStaticProps, GetStaticPaths } from 'next'
import { cachedGetAllPosts } from '~/utils/notion'
import { type ExtendedRecordMap } from 'notion-types'
import { NotionAPI } from 'notion-client'
import BlogPostComponent from '~/components/blog_post'

export const getStaticPaths: GetStaticPaths = async () => {
    const posts = await cachedGetAllPosts()

    return {
        paths: posts.map(post => {
            return {
                params: {
                    slug: post.slug
                }
            }
        }
        ),
        fallback: "blocking"
    }
  }

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const slug = params?.slug
    const posts = await cachedGetAllPosts()
    
    const post = posts.find(post => post.slug === slug)

    if (!post) {
        return {
            notFound: true
        }
    } else {
        const notion = new NotionAPI()
        const recordMap = await notion.getPage(post.id)
        return {
            props: {
                title: post.title,
                recordMap,
            },
            revalidate: 30
        }
    }
}

export default function BlogPost({ recordMap, title }: { recordMap: ExtendedRecordMap, title: string }) {
    return <BlogPostComponent title={title} recordMap={recordMap} />
}

