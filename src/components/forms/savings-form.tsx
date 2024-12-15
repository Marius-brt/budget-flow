'use client';

import AddButton from '@/components/buttons/add-button';
import {useStore} from '@/lib/store';
import {get} from 'lodash-es';
import {Input} from '@/components/ui/input';
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@/components/ui/accordion';
import {PlusIcon, Trash2Icon} from 'lucide-react';
import {useEffect, useMemo, useState} from 'react';
import {Button} from '@/components/ui/button';
import Banner from '@/components/banners/banner';

function SavingInput({path, id}: { path: string, id: string }) {
	const node = get(useStore().rawData.savings, path);
	const {labels, addSaving, updateLabel, updateSaving, deleteSaving} = useStore();
	const [title, setTitle] = useState(labels[id]);
	const [value, setValue] = useState(node.percent);
	const totalSubCategoriesPercent = useMemo(() => {
		return Object.values(node.subCategories).reduce((acc, subCategory) => acc + subCategory.percent, 0);
	}, [node.subCategories]);

	useEffect(() => {
		updateLabel(id, title);
	}, [title]);

	useEffect(() => {
		updateSaving(path, value);
	}, [value]);

	return <AccordionItem
		value={id}
		key={id}
		className="rounded-lg border bg-background px-3 py-1"
	>
		<AccordionTrigger
			className="justify-start gap-3 py-2 text-[15px] leading-6 hover:no-underline [&>svg]:-order-1 max-w-full">
			<span className={'shrink-0 truncate max-w-[40%]'}>{labels[id]} ({node.percent}%)</span>
			<div className={'flex w-full justify-end'}>
				<div className={'flex gap-2 items-center'} onClick={(e) => e.stopPropagation()}>
					<Button variant={'destructive'} size={'icon'} className={'flex gap-2 items-center'}
							onClick={() => deleteSaving(path)}>
						<Trash2Icon size={16}/>
					</Button>
				</div>
			</div>
		</AccordionTrigger>
		<AccordionContent className="pb-2 text-muted-foreground">
			<div className={'flex flex-col gap-2 pt-2'}>
				<div className={'flex gap-2'}>
					<Input placeholder={'Name'} type={'text'} className={'w-full'} value={labels[id]}
						   onChange={(e) => setTitle(e.target.value)}/>
					<div className="relative w-full">
						<Input id="input-13" className={'peer ps-7 pe-28'}
							   placeholder="0.00"
							   type="number" value={value} onFocus={(e) => e.target.select()}
							   onChange={(e) => setValue(parseFloat(e.target.value))}/>
						<span
							className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm text-muted-foreground peer-disabled:opacity-50">
							%
						</span>
						<span
							className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm text-muted-foreground peer-disabled:opacity-50">
							of the category
						</span>
					</div>
				</div>
				<Button onClick={() => addSaving('New saving', path)} variant={'outline'}
						className={'flex gap-2 items-center w-full'}>
					<PlusIcon size={16}/>
					Add sub-category
				</Button>
				{(totalSubCategoriesPercent !== 100 && Object.keys(node.subCategories).length > 0) && <Banner
                    text={totalSubCategoriesPercent > 100 ? 'You are using more than 100% of the category' : `You have ${100 - totalSubCategoriesPercent}% left to use for this category`}/>}
				<Accordion type="single" collapsible className="w-full space-y-2" defaultValue="3">
					{Object.keys(node.subCategories).map((id) => <SavingInput key={id}
																			  path={`${path}.subCategories.${id}`}
																			  id={id}/>)}
				</Accordion>
			</div>
		</AccordionContent>
	</AccordionItem>;

}

export function SavingForm() {
	const nodes = useStore().rawData.savings;
	const {addSaving} = useStore();
	const totalPercent = useMemo(() => {
		return Object.values(nodes).reduce((acc, subCategory) => acc + subCategory.percent, 0);
	}, [nodes]);

	return <div className={'flex flex-col gap-3 p-4 border bg-card text-card-foreground rounded-lg'}>
		{totalPercent !== 100 && <Banner
            text={totalPercent > 100 ? 'You are using more than 100% of your budget' : `You have ${100 - totalPercent}% left to use`}/>}
		<Accordion type="single" collapsible className="w-full space-y-2" defaultValue="3">
			{Object.keys(nodes).map((id) => <SavingInput key={id} id={id} path={id}/>)}
		</Accordion>
		<AddButton onClick={() => addSaving('New saving')} text={'Add saving'}/>
	</div>;
}