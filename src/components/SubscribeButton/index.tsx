import { signIn, useSession, getSession } from 'next-auth/react';
import { api } from '../../services/api';
import { getStripeJs } from '../../services/stripe-js';
import styles from './styles.module.scss';
import NextAuth from "next-auth";

interface Props {
  priceId: string
}

export function SubscribeButton({ priceId }: Props) {
  const { data: session } = useSession();

  async function handleSubscribe() {
    if (!session) {
      signIn('github')
      return
    }

    try {
      const response = await api.post('/subscribe');
      const { sessionId } = response.data;
      const stripe = await getStripeJs();
      await stripe.redirectToCheckout({ sessionId: sessionId })
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <button
      type="button"
      className={styles.subscribeButton}
      onClick={handleSubscribe}
    >
      Subscribe Now

    </button>
  )
}

export async function getServerSideProps(context) {
  const session = await getSession();

  session.activeSession = true;

  return {
    props: {
      session,
    },
  }
}