import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 创建一个路由匹配器，用来检查当前访问的路由是否属于需要保护的路由

// 匹配所有以 /dashboard 开头的路径

// 通常用于身份验证或权限控制
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
	if (isProtectedRoute(req)) {
		await auth.protect();
	}
});

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		// Always run for API routes
		"/(api|trpc)(.*)",
	],
};
