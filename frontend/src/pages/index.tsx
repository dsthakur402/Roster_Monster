
import Head from "next/head"
import { Hero } from "@/components/landing/Hero"
import { Features } from "@/components/landing/Features"

export default function Home() {
  return (
    <>
      <Head>
        <title>HealthRoster - Healthcare Staff Management Made Easy</title>
        <meta name="description" content="Efficiently manage your healthcare facility's roster and staff scheduling with HealthRoster." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main>
        <Hero />
        <Features />
      </main>
    </>
  )
}
