import { auth } from "@clerk/nextjs/server";
import { ExternalLink, Plus } from "lucide-react";

import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";


interface RssFeed {
    id: string;
    url: string;
    title: string | null;
    description: string | null;
    lastFetched: D
}
