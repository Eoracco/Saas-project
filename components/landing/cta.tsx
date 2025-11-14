import { Check } from "lucide-react";
import CTAButtons from "./buttons/CTAButtoms";

export function CTA() {
    return (
        <section className="relative overflow-hidden bg-linear-to-br from-blue-600
        to-purple-600 py-24 sm:py-32">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to-right,
            #ffffff12_1px, transparent_1px),linear-gradient(to-bottom,#ffffff12_1px,
            transparent_1px)] bg-size-[24px-24px]" />

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                        Ready to Save Hours Every Week?
                    </h2>
                    <p>
                        Join thousands of newsletter creators who are already using AI to streamline their content creation. Plans starting at just $9/month.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row items-center
                    justify-center gap-4">
                        <CTAButtons />
                    </div>
                </div>

            </div>
        </section>
    )
}