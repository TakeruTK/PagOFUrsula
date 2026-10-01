import Shop from '@/components/shop';
import { getPieces,getSettings } from '@/lib/store';
export const dynamic='force-dynamic';
export default function Home(){return <Shop pieces={getPieces()} settings={getSettings()}/>;}
