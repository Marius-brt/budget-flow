'use client';

import {useStore} from '@/lib/store';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {cn, numberParser} from '@/lib/utils';
import {useMemo, useState} from 'react';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';

type SummaryDataType = Record<string, {
	percent: number;
	total: number;
	subCategories: {
		total: number;
		id: string;
		path: string[];
	}[]
}>

function getSubCategories(parentAmount: number, id: string, cat: any, path: string[]): {
	total: number,
	id: string,
	path: string[]
}[] {
	const data = [];
	const amount = parentAmount * (cat.percent / 100);
	if (Object.keys(cat.subCategories).length === 0) {
		data.push({
			total: amount,
			id,
			path
		});
	} else {
		for (const [id, value] of Object.entries(cat.subCategories)) {
			data.push(...getSubCategories(amount, id, value, [...path, id]));
		}
	}
	return data;
}

export function Table() {
	const savings = useStore().rawData.savings;
	const {labels, savingTotal} = useStore();
	const [interval, setInterval] = useState(1);

	const summary = useMemo(() => {
		const data: SummaryDataType = {};

		for (const [id, value] of Object.entries(savings)) {
			data[id] = {
				percent: value.percent,
				total: savingTotal * (value.percent / 100),
				subCategories: Object.keys(value.subCategories).length > 0 ? getSubCategories(savingTotal, id, value, []) : []
			};
		}
		return data;
	}, [savingTotal, savings]);

	if (Object.keys(savings).length === 0) return null;

	return <Card>
		<CardHeader className={'relative'}>
			<CardTitle>Summary</CardTitle>
			<CardDescription>
				Here is a summary of your savings.
			</CardDescription>
			<Select value={interval.toString()} onValueChange={(v) => setInterval(parseInt(v))}>
				<SelectTrigger className="w-[180px] absolute top-4 right-6">
					<SelectValue placeholder="Interval"/>
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="1">One time per month</SelectItem>
					<SelectItem value="2">Every 2 weeks</SelectItem>
					<SelectItem value="4">Every week</SelectItem>
				</SelectContent>
			</Select>
		</CardHeader>
		<CardContent className={'flex flex-col gap-2'}>
			{Object.entries(summary).map(([id, value]) => <div key={id}
															   className={'flex flex-col border rounded-lg'}>
				<div
					className={cn('flex w-full justify-between px-4 py-2', value.subCategories.length > 0 && 'border-b')}>
					<h3 className={'font-medium'}>{labels[id]} <span
						className={'text-sm text-muted-foreground'}>({value.percent}%)</span></h3>
					<span>
						{interval !== 1 && <span className={'text-muted-foreground text-xs'}>{interval}x</span>}
						{numberParser(value.total / interval)} €
					</span>
				</div>
				{value.subCategories.length > 0 && <div className={'flex flex-col'}>
					{value.subCategories.map((sub) => <div key={sub.id}
														   className={'flex w-full justify-between px-4 border-b last:border-none py-2 bg-muted'}>
						<div className={'flex gap-2 items-center'}>
							<p className={'text-sm'}>{labels[sub.id]}</p>
							{sub.path.length > 1 && <span
                                className={'text-muted-foreground text-sm'}>({sub.path.map((id) => labels[id]).join(' → ')})</span>}
						</div>
						<span>
						{interval !== 1 && <span className={'text-muted-foreground text-xs'}>{interval}x</span>}
							{numberParser(sub.total / interval)} €
						</span>
					</div>)}
                </div>}
			</div>)}
		</CardContent>
	</Card>;
}