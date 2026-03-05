import ClientPage from "./ClientPage";

export function generateStaticParams() {
    return [{ id: 'unresolved' }];
}

export const dynamicParams = false;

interface ConversationPageProps {
    params: { id: string };
}

export default function ConversationPage({ params }: ConversationPageProps) {
    return <ClientPage />;
}
