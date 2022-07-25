import styles from './styles.module.scss';
import Head from 'next/head';
import * as Prismic from '@prismicio/client';
import { GetStaticProps } from 'next';
import { getPrismicClient } from '../../services/prismic';
import Link from 'next/link';

interface PostsProps {
  posts: [{
    slug: string,
    title: string,
    excerpt: string,
    updatedAt: string,
  }]
}

export default function Posts({ posts }) {
  return (
    <>
      <Head>
        <title>Posts | Ignews</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>

          {posts.map(post => (
            <Link key={post.slug} href={`posts/${post.slug}`}>
              <a>
                <time>{post.updatedAt}</time>
                <strong>{post.title}</strong>
                <p>{post.excerpt}</p>
              </a>
            </Link>
          ))}

        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const response = await prismic.query([
    Prismic.predicate.at('document.type', 'post')
  ], {
    fetch: ['post.title', 'post.content'],
    pageSize: 100
  })

  const posts = response.results.map((post) => {

    return {
      slug: post.uid,
      title: post.data.title,
      excerpt: post.data.content[0].text.slice(0, post.data.content[0].text.indexOf('\n')),
      updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    }
  })

  return {
    props: { posts }
  }
}
