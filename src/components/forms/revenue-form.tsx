'use client';

import AmountInput from '@/components/inputs/amount-input';
import AddButton from '@/components/buttons/add-button';
import {useStore} from '@/lib/store';

export function RevenueForm({type}: {
	type: 'needs' | 'wants' | 'revenues'
}) {
	const nodes = useStore().rawData[type];
	const {addNode, labels} = useStore();

	return <div className={'flex flex-col gap-3 p-4 border bg-card text-card-foreground rounded-lg'}>
		{Object.entries(nodes).map(([id, value]) => <AmountInput key={id} id={id} defaultValue={value}
																 defaultText={labels[id]} type={type}/>)}
		<AddButton onClick={() => addNode('New Data', type)}/>
	</div>;
}