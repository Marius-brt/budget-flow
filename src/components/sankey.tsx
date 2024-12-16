import {ResponsiveSankey} from '@nivo/sankey';
import {numberParser} from '@/lib/utils';
import {useStore} from '@/lib/store';
import {useTheme} from 'next-themes';

export function Sankey() {
	const {data, labels} = useStore();
	const {theme} = useTheme();

	return <div className={'h-[50vh] w-full'}>
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
	</div>;
}