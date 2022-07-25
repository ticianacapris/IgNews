import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

import { fauna } from '../../../services/fauna';
import { query as q } from "faunadb";

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization :{
        params: {
          scope: 'read:user'
        }
      }
    }),
  ],
  callbacks: {
    async session(session){      
      return {
        ...session.session,
        activeSession: false,
      }
    },
    
    async signIn(user){
      const {email} = user.user;

      await fauna.query(
        q.If( //se
          q.Not( //não
            q.Exists( //existir
              q.Match( //um usuario com esse email
                q.Index('user_by_email'),
                q.Casefold(email)
              )
            )
          ),
          q.Create( //entao cria ele
            q.Collection('users'),
            {data : { email }}
          ),
          q.Get( // se não, pega ele
            q.Match(
              q.Index('user_by_email'),
              q.Casefold(email)
            )
          )
        )
      )
      return true; 

    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  
})