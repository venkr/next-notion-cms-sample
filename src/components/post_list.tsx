import { type Post } from '~/utils/notion'
import Link from 'next/link'

export default function PostList({ posts, slug }: { posts: Post[], slug: string }) {
    return <ul>
    {
        posts.map(post => {
            return (
                <li key={post.id}>
                    <div style={{display: "flex", justifyContent: "space-between"}}>
                        <Link href={`/${slug}/${post.slug}`}>
                            <p style={{margin: "0px"}}>{post.title}</p>
                        </Link>
                        <p style={{margin: "0px", flexShrink: "0"}}>{post.date}</p>
                    </div>
                </li>
            )
        })
    }
    </ul>
}