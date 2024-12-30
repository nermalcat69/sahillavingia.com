import { getPostBySlug } from '@/lib/mdx.server'
import { compileMDX } from 'next-mdx-remote/rsc'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Tweet from '@/components/Tweet'
import Footer from "@/app/footer"
import Power from "@/components/Power"
import ExternalLink from "@/components/ui/ExternalLink"
import { Metadata } from 'next'
import Image from '@/components/ui/Image'
import ChatMessages from '@/components/ChatMessages'
import ScrollProgress from '@/components/ScrollProgress'

const components = {
    Tweet,
    Footer,
    Power,
    Image: Image,
    ChatMessages,
    a: ({ href, ...props }) => {
        if (href?.startsWith('http')) {
            return <ExternalLink children={undefined} href={href} {...props} />
        }
        return <Link href={href || '/'} {...props} />
    }
}

function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

export async function generateMetadata({ params }): Promise<Metadata> {
    try {
        const post = getPostBySlug(params.slug)
        const { frontMatter } = post

        return {
            title: frontMatter.title,
            description: frontMatter.description,
            openGraph: frontMatter.openGraph,
            twitter: frontMatter.twitter,
        }
    } catch (e) {
        return {
            title: 'Not Found',
            description: 'Page not found',
        }
    }
}

export default async function Page({ params }: { params: { slug: string } }) {
    try {
        const { frontMatter, content } = getPostBySlug(params.slug)

        const { content: mdxContent } = await compileMDX({
            source: content,
            components,
            options: {
                parseFrontmatter: true,
            },
        })

        return (
            <>
                <ScrollProgress />
                <main className="prose mx-auto py-5 sm:py-24 flex-1 w-full max-w-3xl relative z-10">
                    <div className="bg-white z-50  sticky py-3 my-auto  top-0 left-0">
                        <Link
                            href="/"
                            className="text-sm  text-gray-600 items-center flex hover:text-gray-900 underline block"
                        >
                            ← Back to Home
                        </Link>
                    </div>

                    {(frontMatter.date || frontMatter.author) && (
                        <div className="text-gray-600 mt-4 mb-3">
                            {frontMatter.date && formatDate(frontMatter.date)}
                            {frontMatter.date && frontMatter.author && " by "}
                            {frontMatter.author && (
                                <Link href="/" className="hover:text-gray-900">
                                    <u>{frontMatter.author}</u>
                                </Link>
                            )}
                        </div>
                    )}

                    <div className="mb-8">
                        <h1>{frontMatter.title}</h1>
                    </div>

                    {mdxContent}
                </main>
            </>
        )
    } catch (e) {
        notFound()
    }
} 