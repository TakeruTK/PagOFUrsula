import { notFound } from 'next/navigation';
// Unknown addresses inside a language render the translated 404 within the shop's layout.
export default function CatchAll() { notFound(); }
