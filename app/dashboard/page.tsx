import { PageHeader } from "@/components/dashboard/page-header";
import { RssFeedManager } from "@/components/dashboard/rss-feed-manager";
import { Sparkles } from "lucide-react";
import { NewsletterGenerator } from "@/components/dashboard/newsletter-generator";


export default function Dashboard() {
	return (
		<div className="min-h-screen bg-linear-to-b from-white to-gray-50 dark:from-black dark:to-gray-950 ">

			<div className="container mx-auto py-12 px-6 lg:px-8 space-y-12 ">

				{/* page header */}
				<PageHeader
					icon={Sparkles}
					title="Dashboard"
					description="Manage your Rss fees and generate AI-powered newsletters"
				/>

				{/* main Content - two column layout */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Left Colume - Rss Feed Manager */}
					<div>
						<RssFeedManager />
					</div>

					{/* Right Colume- newsletter Generator */}
					<div>
						<NewsletterGenerator />
					</div>
				</div>
			</div>


		</div>
	)
}
