import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function CTAButtons() {
    const { has, userId } = await auth();  //auth() 返回一个 Promise，解析后返回一个对象 await 等待 Promise 解析完成 解构从解析后的对象中提取 has 和 userId 属性
    const hasPainPlan = (await has({ plan: 'pro' })) || (await has({ plan: 'starter' }));

    return (
        <>
            {/* Signed out user */}
            <SignedOut>
                <SignInButton mode="modal" forceRedirectUrl="/#pricing">
                    <Button size="lg" className="w-full sm:w-auto">
                        Get Started <ArrowRight className="ml-2 size-4" />
                    </Button>
                </SignInButton>
                <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                >
                    <Link href="#pricing">View Pricing</Link>
                </Button>
            </SignedOut>

            {/* Signed in users with a plan */}
            {userId && hasPainPlan && (
                <SignedIn>
                    <Button size='lg' className="w-full sm:w-auto" asChild>
                        <Link
                            href="/dashboard"
                            className="flex items-center justify-center"
                        >
                            Go to Dashboard <ArrowRight className="ml-2 size-4" />
                        </Link>
                    </Button>
                </SignedIn>
            )}

            {/* Signed in users without a plan */}
            {userId && !hasPainPlan && (
                <SignedIn>
                    <Button size='lg' className="w-full sm:w-auto" asChild>
                        <Link href="/#pricing" className="flex items-center justify-center">
                            Choose a Plan  <ArrowRight className="ml-2 size-4" />
                        </Link>
                    </Button>
                    <Button
                        asChild
                        size='lg'
                        variant='outline'
                        className="w-full sm:auto"
                    >
                        <Link href="#pricing">View Pricing</Link>
                    </Button>
                </SignedIn>
            )}
        </>
    )

}

export default CTAButtons;