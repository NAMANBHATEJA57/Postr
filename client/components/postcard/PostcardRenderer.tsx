/**
 * PostcardRenderer — entry point for postcard display.
 * Delegates rendering to PostcardContainer which handles the two-sided flip.
 * Kept as a Server Component wrapper for clean import paths.
 */
import PostcardContainer from "./PostcardContainer";
import { ApiPostcardResponse } from "@/types/postcard";

interface PostcardRendererProps {
    postcard: ApiPostcardResponse;
}

export default function PostcardRenderer({ postcard }: PostcardRendererProps) {
    return <PostcardContainer postcard={postcard} />;
}
