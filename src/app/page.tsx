'use client';

import {ResponsiveSankey} from '@nivo/sankey';
import {RevenueForm} from '@/components/forms/revenue-form';
import {generateJSON, useStore} from '@/lib/store';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {useMemo} from 'react';
import {numberParser} from '@/lib/utils';
import {Button} from '@/components/ui/button';
import {Download, Upload} from 'lucide-react';
import ThemeButton from '@/components/buttons/theme-button';

export default function Home() {
	const {nodes, links, labels, revenuesValue, savingValue, needsValue, wantsValue, importData} = useStore();

	const percentages = useMemo(() => {
		if (revenuesValue === 0) {
			return {
				needs: 0,
				wants: 0,
				savings: 0
			};
		}
		const v = {
			needs: Math.round(needsValue / revenuesValue * 100),
			wants: Math.round(wantsValue / revenuesValue * 100),
			savings: Math.round(savingValue / revenuesValue * 100)
		};
		return {
			needs: isNaN(v.needs) ? 0 : v.needs,
			wants: isNaN(v.wants) ? 0 : v.wants,
			savings: isNaN(v.savings) ? 0 : v.savings
		};
	}, [revenuesValue, savingValue, needsValue, wantsValue]);

	const total = useMemo(() => needsValue + wantsValue + savingValue, [needsValue, wantsValue, savingValue]);

	return <>
		<div className={'flex justify-between gap-4 max-md:flex-col'}>
			<div className={'flex flex-col'}>
				<h1 className={'text-2xl font-bold'}>Investment tool</h1>
				<p className={'text-muted-foreground'}>Add your revenues and expenses to see how you spend your
					money.</p>
			</div>
			<div className={'flex gap-2'}>
				<Button variant={'ghost'} onClick={generateJSON} className={'flex items-center gap-2'}><Download
					size={16}/>Export</Button>
				<Button variant={'ghost'} onClick={() => {
					document.getElementById('input')?.click();
				}} className={'flex items-center gap-2'}><Upload
					size={16}/>Import</Button>
				<ThemeButton/>
				<input type={'file'} className={'hidden'} id={'input'} accept={'.json'} onChange={(e) => {
					try {
						if (e.target.files && e.target.files.length > 0) {
							const reader = new FileReader();
							reader.onload = (event) => {
								if (event.target) {
									importData(JSON.parse(event.target.result as string));
									e.target.value = '';
								}
							};
							reader.readAsText(e.target.files[0]);
						}
					} catch (e) {
						console.error(e);
					}
				}}/>
			</div>
		</div>

		<Tabs defaultValue="revenue" className="w-full">
			<TabsList className="w-full flex gap-2">
				<TabsTrigger value="revenue" className={'w-full'}>Revenues</TabsTrigger>
				<TabsTrigger value="needs" className={'w-full'}>Needs</TabsTrigger>
				<TabsTrigger value="wants" className={'w-full'}>Wants</TabsTrigger>
				<TabsTrigger value="savings" className={'w-full'}>Savings</TabsTrigger>
			</TabsList>
			<TabsContent value="revenue">
				<RevenueForm type={'REVENUES'}/>
			</TabsContent>
			<TabsContent value="needs">
				<RevenueForm type={'NEEDS'}/>
			</TabsContent>
			<TabsContent value="wants">
				<RevenueForm type={'WANTS'}/>
			</TabsContent>
			<TabsContent value="savings">
				<RevenueForm type={'SAVINGS'}/>
			</TabsContent>
		</Tabs>

		<p>Your revenues are <span className={'font-semibold'}>{numberParser(revenuesValue)}€</span>. You spend <span
			className={'font-semibold'}>{numberParser(needsValue)}€</span> ({percentages.needs}%) on your needs, <span
			className={'font-semibold'}>{numberParser(wantsValue)}€</span> ({percentages.wants}%) on your wants,
			and <span className={'font-semibold'}>{numberParser(savingValue)}€</span> ({percentages.savings}%) on your
			savings.
			{revenuesValue > 0 && total > revenuesValue && <> You spend more than you earn <span
                className="font-semibold">({numberParser(revenuesValue - total)}€)</span>.</>}
		</p>

		{(nodes.length > 4 && revenuesValue > 0) &&
            <div className={'h-[50vh] w-full'}>
                <ResponsiveSankey
                    data={{
						nodes,
						links
					}}
                    margin={{top: 0, right: 0, bottom: 0, left: 0}}
                    sort="auto"
                    colors={{scheme: 'category10'}}
                    nodeOpacity={1}
                    nodeHoverOthersOpacity={0.35}
                    nodeThickness={4}
                    nodeSpacing={10}
                    nodeBorderWidth={0}
                    nodeBorderColor={{
						from: 'color',
						modifiers: [
							[
								'darker',
								0.8
							]
						]
					}}
                    nodeBorderRadius={3}
                    enableLinkGradient
                    linkOpacity={0.4}
                    linkHoverOthersOpacity={0.1}
                    linkContract={3}
                    linkBlendMode="normal"
                    labelPosition="inside"
                    labelOrientation="horizontal"
                    labelPadding={16}
                    label={(node) => labels[node.id]}
                    labelTextColor={{
						from: 'color',
						modifiers: [
							[
								'darker',
								1
							]
						]
					}}
                />
            </div>}
	</>;
}
