
import OneCentImage from '../../public/images/monnaie/1cent.png';
import TwoCentsImage from '../../public/images/monnaie/2cents.png';
import FiveCentsImage from '../../public/images/monnaie/5cents.png';
import TenCentsImage from '../../public/images/monnaie/10cents.png';
import TwentyCentsImage from '../../public/images/monnaie/20cents.png';
import FiftyCentsImage from '../../public/images/monnaie/50cents.png';
import OneEuroImage from '../../public/images/monnaie/1euro.png';
import TwoEurosImage from '../../public/images/monnaie/2euros.png';
import FiveEurosImage from '../../public/images/monnaie/5euros.png';
import TenEurosImage from '../../public/images/monnaie/10euros.png';
import TwentyEurosImage from '../../public/images/monnaie/20euros.png';
import FiftyEurosImage from '../../public/images/monnaie/50euros.png';

interface CurrencyItem {
    name: string;
    value: number;
    image: string;
    type: 'pièce' | 'billet';
}

export const currency: CurrencyItem[] = [
    { name: '1c', value: 0.01, image: OneCentImage.src, type: 'pièce' },
    { name: '2c', value: 0.02, image: TwoCentsImage.src, type: 'pièce' },
    { name: '5c', value: 0.05, image: FiveCentsImage.src, type: 'pièce' },
    { name: '10c', value: 0.10, image: TenCentsImage.src, type: 'pièce' },
    { name: '20c', value: 0.20, image: TwentyCentsImage.src, type: 'pièce' },
    { name: '50c', value: 0.50, image: FiftyCentsImage.src, type: 'pièce' },
    { name: '1€', value: 1.00, image: OneEuroImage.src, type: 'pièce' },
    { name: '2€', value: 2.00, image: TwoEurosImage.src, type: 'pièce' },
    { name: '5€', value: 5.00, image: FiveEurosImage.src, type: 'billet' },
    { name: '10€', value: 10.00, image: TenEurosImage.src, type: 'billet' },
    { name: '20€', value: 20.00, image: TwentyEurosImage.src, type: 'billet' },
    { name: '50€', value: 50.00, image: FiftyEurosImage.src, type: 'billet' },
];

export const euroPiecesAndBillets = currency.filter(c => c.value >= 1); // Only euros
export const allCoins = currency.filter(c => c.type.startsWith('pièce'));

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
    }).format(amount);
}
