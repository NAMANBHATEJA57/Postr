import ClientPage from "./ClientPage";


interface ConversationPageProps {
    params: { id: string };
}

export default function ConversationPage({ params }: ConversationPageProps) {
    return <ClientPage />;
}
