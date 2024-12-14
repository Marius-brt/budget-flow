import {Input} from '@/components/ui/input';
import {useEffect, useState} from 'react';
import {Trash2Icon} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {ParentType, useStore} from '@/lib/store';
import {cn} from '@/lib/utils';

export default function AmountInput({id, type, defaultText, defaultValue}: {
	id: string,
	type: ParentType,
	defaultText: string,
	defaultValue: number
}) {
	const {removeNode, setNode} = useStore();
	const [text, setText] = useState(defaultText);
	const [value, setValue] = useState(defaultValue);

	useEffect(() => {
		setNode(id, text, value, type);
	}, [text, value]);

	return <div className={'flex gap-2'}>
		<Input placeholder={'Name'} type={'text'} className={'w-full'} value={text}
			   onChange={(e) => setText(e.target.value)}/>
		<div className="relative w-full">
			<Input id="input-13" className={cn('peer', type === 'SAVINGS' ? 'ps-7 pe-28' : 'ps-6 pe-12')}
				   placeholder="0.00"
				   type="number" value={value}
				   onChange={(e) => setValue(parseFloat(e.target.value))}/>
			<span
				className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm text-muted-foreground peer-disabled:opacity-50">
          {type === 'SAVINGS' ? '%' : '€'}
        </span>
			<span
				className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm text-muted-foreground peer-disabled:opacity-50">
          {type === 'SAVINGS' ? 'of your income' : 'EUR'}
        </span>
		</div>
		<Button
			variant="outline"
			size="icon"
			onClick={() => removeNode(id)}
			className={'shrink-0'}
		>
			<Trash2Icon size={16}/>
		</Button>
	</div>;
}


