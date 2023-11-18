import { type ExtendedRecordMap } from 'notion-types'
import { NotionRenderer } from 'react-notion-x'
import dynamic from 'next/dynamic'

const Code = dynamic(() =>
  import('react-notion-x/build/third-party/code').then((m) => m.Code)
)

export default function BlogPostComponent({ recordMap, title }: { recordMap: ExtendedRecordMap, title: string }) {
    return (
        <>
        <h1 className = "text-2xl font-bold text-center">
            {title}
            </h1>
        <div>
            <NotionRenderer recordMap={recordMap} fullPage={false} darkMode={false} components={{ Code }} />
        </div>
        </>
    )
}