
import { useState } from "react"
import { SignInForm } from "@/components/auth/SignInForm"
import { SignUpForm } from "@/components/auth/SignUpForm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Head from "next/head"

export default function SignInPage() {
  const [activeTab, setActiveTab] = useState("signin")

  return (
    <>
      <Head>
        <title>Sign In - HealthRoster</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <SignInForm />
            </TabsContent>
            <TabsContent value="signup">
              <SignUpForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
