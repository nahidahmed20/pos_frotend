import { redirect } from 'next/navigation';
export default async function ProductEditPage({ params }) {
    const resolvedParams = await params;
    redirect(`/dashboard/products?edit=${resolvedParams?.id || ''}`);
}
