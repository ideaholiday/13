import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        // Google profile fields: sub, email, name, picture
        token.id = profile.sub
        token.email = profile.email
        token.name = profile.name
        token.picture = (profile as any).picture // fallback for type
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        session.user.email = token.email as string | null | undefined
        session.user.name = token.name as string | null | undefined
        session.user.image = token.picture as string | null | undefined
      }
      return session
    }
  }
})
