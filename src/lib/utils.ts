import {type ClassValue, clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function numberParser(value: number) {
	return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}