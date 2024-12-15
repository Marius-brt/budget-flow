import {z} from 'zod';

const savingSchema = z.object({
	percent: z.number(),
	subCategories: z.record(z.string(), z.lazy((): z.ZodSchema => savingSchema))
});

export const dataSchema = z.object({
	revenues: z.record(z.string(), z.number()),
	needs: z.record(z.string(), z.number()),
	wants: z.record(z.string(), z.number()),
	savings: z.record(z.string(), savingSchema)
});

export const importSchema = z.object({
	labels: z.record(z.string(), z.string()),
	rawData: dataSchema
});

type NodeType = {
	id: string,
}

type LinkType = {
	source: string,
	target: string,
	value: number,
}

export type SankeyDataType = {
	nodes: NodeType[]
	links: LinkType[]
}

export type NodeId = 'savings' | 'needs' | 'wants' | 'revenues';

const ids: Record<NodeId, string> = {
	savings: 'savings',
	needs: 'needs',
	wants: 'wants',
	revenues: 'revenues'
};

const defaultNodes: NodeType[] = [
	{id: ids.revenues},
	{id: ids.needs},
	{id: ids.wants},
	{id: ids.savings}
];

export function checkData(data: any): z.infer<typeof importSchema> | null {
	try {
		return importSchema.parse(data);
	} catch (e) {
		console.log(e);
		return null;
	}
}

function convertToNodeAndLinks(type: NodeId, data: Record<string, number>): {
	nodes: NodeType[],
	links: LinkType[],
	total: number
} {
	const nodes: NodeType[] = [];
	const links: LinkType[] = [];
	let total = 0;

	Object.entries(data).forEach(([id, value]) => {
		nodes.push({id});
		total += value;
		if (type !== 'revenues') {
			links.push({source: ids[type], target: id, value});
		} else {
			links.push({source: id, target: ids[type], value});
		}
	});

	return {nodes, links, total};
}

function generateSavingNodesAndLinks(id: string, source: string, percent: number, amount: number, subCat: z.infer<typeof savingSchema>): {
	nodes: NodeType[],
	links: LinkType[]
} {
	const value = amount * percent / 100;
	const nodes: NodeType[] = [{id}];
	const links: LinkType[] = [{source: source, target: id, value}];

	if (subCat.subCategories) {
		for (const [subId, subData] of Object.entries(subCat.subCategories)) {
			const {
				nodes: subNodes,
				links: subLinks
			} = generateSavingNodesAndLinks(subId, id, subData.percent, value, subData);
			nodes.push(...subNodes);
			links.push(...subLinks);
		}
	}

	return {nodes, links};
}

export function convertToSankey(data: z.infer<typeof dataSchema>): {
	revenuesTotal: number,
	needsTotal: number,
	wantsTotal: number,
	savingTotal: number,
	data: SankeyDataType
} {
	const nodes: NodeType[] = [...defaultNodes];
	const links: LinkType[] = [];

	const needs = convertToNodeAndLinks('needs', data.needs);
	const wants = convertToNodeAndLinks('wants', data.wants);
	const revenues = convertToNodeAndLinks('revenues', data.revenues);

	nodes.push(...needs.nodes, ...wants.nodes, ...revenues.nodes);
	links.push(...needs.links, ...wants.links, ...revenues.links);

	links.push({source: ids.revenues, target: ids.needs, value: needs.total});
	links.push({source: ids.revenues, target: ids.wants, value: wants.total});

	const revenueRemaining = Math.max(revenues.total - needs.total - wants.total, 0);
	links.push({source: ids.revenues, target: ids.savings, value: revenueRemaining});

	for (const [id, savingData] of Object.entries(data.savings)) {
		const {
			nodes: savingNodes,
			links: savingLinks
		} = generateSavingNodesAndLinks(id, ids.savings, savingData.percent, revenueRemaining, savingData);
		nodes.push(...savingNodes);
		links.push(...savingLinks);
	}

	return {
		revenuesTotal: revenues.total,
		needsTotal: needs.total,
		wantsTotal: wants.total,
		savingTotal: revenueRemaining,
		data: {nodes, links}
	};
}