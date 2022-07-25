import { GetStaticProps } from "next";
import { useSession } from "next-auth/react";
import { getPrismicClient } from "../../services/prismic";
import { RichText } from "prismic-dom";
import Head from 'next/head';
import styles from '../posts/post.module.scss';
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/router";

interface PostPreviewProps {
  post: {
    slug: string,
    title: string,
    content: string,
    updatedAt: string
  }
}

export default function PostPreview({ post }: PostPreviewProps) {

  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.activeSession) {
      router.push(`/posts/${post.slug}`)
    }
  }, [session])



  return (
    <>
      <Head>
        <title>{post.title} | Ignews</title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div
            className={`${styles.postContent} ${styles.previewContent}`}
            dangerouslySetInnerHTML={{ __html: post.content }} />

          <div className={styles.continue}>
            Wanna continue reading?
            <Link href="/">
              <a>Subscribe now 🤗</a>
            </Link>
          </div>
        </article>
      </main>
    </>
  )
}

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(params.slug), {});

  const post = {
    slug: params.slug,
    title: response.data.title,
    content: RichText.asHtml(response.data.content).slice(0, 500),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return {
    props: {
      post
    },
    redirect: 60 * 30,
  }
}