import {Input} from '@/components/ui/input';
import {useEffect, useState} from 'react';
import {Trash2Icon} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useStore} from '@/lib/store';

export default function AmountInput({id, type, defaultText, defaultValue}: {
	id: string,
	type: 'needs' | 'wants' | 'revenues',
	defaultText: string,
	defaultValue: number
}) {
	const {updateLabel, updateData, removeNode} = useStore();
	const [text, setText] = useState(defaultText);
	const [value, setValue] = useState(defaultValue);

	useEffect(() => {
		updateLabel(id, text);
	}, [text]);

	useEffect(() => {
		updateData(type, id, value);
	}, [value]);

	return <div className={'flex gap-2'}>
		<Input placeholder={'Name'} type={'text'} className={'w-full'} value={text}
			   onChange={(e) => setText(e.target.value)}/>
		<div className="relative w-full">
			<Input id="input-13" className={'peer ps-6 pe-12'}
				   placeholder="0.00"
				   min={0}
				   type="number" value={value} onFocus={(e) => e.target.select()}
				   onChange={(e) => setValue(parseFloat(e.target.value))}/>
			<span
				className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm text-muted-foreground peer-disabled:opacity-50">
          €
        </span>
			<span
				className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm text-muted-foreground peer-disabled:opacity-50">
         EUR
        </span>
		</div>
		<Button
			variant="outline"
			size="icon"
			onClick={() => removeNode(id, type)}
			className={'shrink-0'}
		>
			<Trash2Icon size={16}/>
		</Button>
	</div>;
}


