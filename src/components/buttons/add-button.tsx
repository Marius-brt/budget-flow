// Dependencies: pnpm install lucide-react

import {Button} from '@/components/ui/button';
import {Plus} from 'lucide-react';

export default function AddButton({onClick, text}: Readonly<{ onClick?: () => void, text?: string }>) {
	return (
		<Button variant="outline" className="w-full max-sm:p-0" onClick={onClick}>
			<Plus className="opacity-60 sm:-ms-1 sm:me-2" size={16} strokeWidth={2} aria-hidden="true"/>
			<span>{text ?? 'Add line'}</span>
		</Button>
	);
}
