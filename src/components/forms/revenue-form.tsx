'use client';

import AmountInput from '@/components/inputs/amount-input';
import AddButton from '@/components/buttons/add-button';
import {ParentType, useStore} from '@/lib/store';

export function RevenueForm({type}: {
	type: ParentType
}) {
	const nodes = useStore().nodes.filter((node) => node.type === type && node.isNode);
	const {setNode, labels, getNodeValue} = useStore();

	return <div className={'flex flex-col gap-3 p-4 border bg-card text-card-foreground rounded-lg'}>
		{nodes.map((node) => <AmountInput key={node.id} id={node.id} type={type}
										  defaultText={labels[node.id]} defaultValue={getNodeValue(node.id)}/>)}
		<AddButton onClick={() => setNode(Date.now().toString(), 'New Data', 0, type)}/>
	</div>;
}