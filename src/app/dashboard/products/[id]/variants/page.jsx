import { redirect } from 'next/navigation';
export default async function ProductVariantsDetailsPage({ params }) {
    const resolvedParams = await params;
    redirect(`/dashboard/product-variants?product_id=${resolvedParams?.id || ''}`);
}
