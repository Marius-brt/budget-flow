import {type ClassValue, clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';
import {toast} from 'sonner';
import {CircleCheck, X} from 'lucide-react';
import {Button} from '@/components/ui/button';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function numberParser(value: number) {
	return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function errorToast(message: string) {
	toast.custom((t) => (
		<div
			className="z-[100] max-w-[400px] rounded-lg border border-border bg-background px-4 py-3 shadow-lg shadow-black/5">
			<div className="flex gap-2">
				<p className="grow text-sm">
					<CircleCheck
						className="-mt-0.5 me-3 inline-flex text-red-500"
						size={16}
						strokeWidth={2}
						aria-hidden="true"
					/>
					{message}
				</p>
				<Button
					variant="ghost"
					className="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
					aria-label="Close notification"
				>
					<X
						size={16}
						strokeWidth={2}
						className="opacity-60 transition-opacity group-hover:opacity-100"
						aria-hidden="true"
					/>
				</Button>
			</div>
		</div>
	));
}