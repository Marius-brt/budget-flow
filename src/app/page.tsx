'use client';

import {RevenueForm} from '@/components/forms/revenue-form';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Button} from '@/components/ui/button';
import {Download, Upload} from 'lucide-react';
import dynamic from 'next/dynamic';
import {generateJSON, useStore} from '@/lib/store';
import {useMemo} from 'react';
import {ResponsiveSankey} from '@nivo/sankey';
import {errorToast, numberParser} from '@/lib/utils';
import {SavingForm} from '@/components/forms/savings-form';
import {checkData} from '@/lib/schema';
import {useTheme} from 'next-themes';
import Link from 'next/link';
import Banner from '@/components/banners/banner';
import {Table} from '@/components/table';
import Image from 'next/image';

const ThemeButton = dynamic(() => import('@/components/buttons/theme-button'), {ssr: false});

export default function Home() {
	const {importData, data, labels, revenuesTotal, wantsTotal, needsTotal, savingTotal} = useStore();

	const percentages = useMemo(() => {
		if (revenuesTotal === 0) {
			return {
				needs: 0,
				wants: 0,
				savings: 0
			};
		}
		const v = {
			needs: Math.round(needsTotal / revenuesTotal * 100),
			wants: Math.round(wantsTotal / revenuesTotal * 100),
			savings: Math.round(savingTotal / revenuesTotal * 100)
		};
		return {
			needs: isNaN(v.needs) ? 0 : v.needs,
			wants: isNaN(v.wants) ? 0 : v.wants,
			savings: isNaN(v.savings) ? 0 : v.savings
		};
	}, [revenuesTotal, needsTotal, wantsTotal, savingTotal]);

	const {theme} = useTheme();
	const total = useMemo(() => needsTotal + wantsTotal + savingTotal, [needsTotal, wantsTotal, savingTotal]);

	return <>
		<div className={'flex justify-between gap-4 max-md:flex-col'}>
			<div className={'flex flex-col gap-1'}>
				<div className={'flex items-center gap-2 justify-start'}>
					<Image src={'/logo.svg'} alt={'logo'} className={'dark:border rounded-lg aspect-square'}
						   width={28}
						   height={28}/>
					<h1 className={'text-2xl font-bold'}>Saving calculator</h1>
				</div>
				<p className={'text-muted-foreground'}>
					Easily calculate your savings, needs, and wants. Made by <Link href={'https://mariusbrt.com'}
																				   className={'underline font-semibold'}>Marius
					Brouty</Link>.
				</p>
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
									const data = JSON.parse(event.target.result as string);
									if (checkData(data)) {
										importData(data);
										e.target.value = '';
									} else {
										errorToast('File is not valid');
									}
								}
							};
							reader.readAsText(e.target.files[0]);
						}
					} catch (e) {
						errorToast('Failed to import data');
					}
				}}/>
			</div>
		</div>

		<Tabs defaultValue="revenue" className="w-full mt-4">
			<TabsList className="w-full flex gap-2">
				<TabsTrigger value="revenue" className={'w-full'}>Revenues</TabsTrigger>
				<TabsTrigger value="needs" className={'w-full'}>Needs</TabsTrigger>
				<TabsTrigger value="wants" className={'w-full'}>Wants</TabsTrigger>
				<TabsTrigger value="savings" className={'w-full'}>Savings</TabsTrigger>
			</TabsList>
			<TabsContent value="revenue">
				<RevenueForm type={'revenues'}/>
			</TabsContent>
			<TabsContent value="needs">
				<RevenueForm type={'needs'}/>
			</TabsContent>
			<TabsContent value="wants">
				<RevenueForm type={'wants'}/>
			</TabsContent>
			<TabsContent value="savings">
				<SavingForm/>
			</TabsContent>
		</Tabs>

		{revenuesTotal > 0 && total > revenuesTotal && <Banner
            text={`You spend more than you earn (${numberParser(revenuesTotal - total)}€)`}/>}

		<p className={'pt-4'}>Your revenues are <span className={'font-semibold'}>{numberParser(revenuesTotal)}€</span>.
			You spend <span
				className={'font-semibold'}>{numberParser(needsTotal)}€</span> ({percentages.needs}%) on your
			needs, <span
				className={'font-semibold'}>{numberParser(wantsTotal)}€</span> ({percentages.wants}%) on your wants,
			and <span className={'font-semibold'}>{numberParser(savingTotal)}€</span> ({percentages.savings}%) on your
			savings.
		</p>

		{revenuesTotal > 0 && <>
            <div className={'h-[50vh] w-full'}>
                <ResponsiveSankey
                    data={data}
                    margin={{top: 10, right: 0, bottom: 10, left: 0}}
                    sort="input"
                    colors={{scheme: 'nivo'}}
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
                    linkOpacity={theme === 'light' ? 0.7 : 0.4}
                    linkHoverOthersOpacity={0.1}
                    linkContract={3}
                    linkBlendMode="normal"
                    labelPosition="inside"
                    labelOrientation="horizontal"
                    labelPadding={16}
                    linkTooltip={({link}) => <div
						className={'border bg-card text-card-foreground rounded-lg py-2 px-4 shadow-lg'}>
						<p>{labels[link.source.id]} → {labels[link.target.id]}</p>
						<p className={'text-sm text-muted-foreground'}>{numberParser(link.value)}€</p>
					</div>}
                    nodeTooltip={({node}) => <div
						className={'border bg-card text-card-foreground rounded-lg py-2 px-4 shadow-lg min-w-[150px]'}>
						<p>{labels[node.id]}</p>
						<p className={'text-sm text-muted-foreground'}>{numberParser(node.value)}€</p>
					</div>}
                    label={(node) => labels[node.id]}
                    labelTextColor={{
						from: 'color',
						modifiers: theme === 'light' ? [
							[
								'darker',
								0.8
							]
						] : [
							[
								'brighter',
								0.8
							]
						]
					}}
                />
            </div>
            <Table/>
        </>}
	</>;
}
