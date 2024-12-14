import {create} from 'zustand';
import {immer} from 'zustand/middleware/immer';

type State = {
	labels: Record<string, string>,
	savingValue: number,
	needsValue: number,
	wantsValue: number,
	revenuesValue: number,
	nodes: {
		id: string,
		nodeColor: string,
		type: ParentType,
		isNode?: boolean,
	}[],
	links: {
		source: string,
		target: string,
		value: number,
		percent?: number
	}[]
}

type Actions = {
	setNode: (id: string, name: string, value: number, type: ParentType) => void,
	removeNode: (id: string) => void,
	getNodeValue: (id: string) => number,
	updateLinkValue: (source: string, target: string, value: number) => void,
	importData: (data: State) => void
}

export type ParentType = 'SAVINGS' | 'NEEDS' | 'WANTS' | 'REVENUES';

const ids: Record<ParentType, string> = {
	SAVINGS: 'saving',
	NEEDS: 'needs',
	WANTS: 'wants',
	REVENUES: 'revenues'
};

const colors: Record<ParentType, string> = {
	SAVINGS: 'blue',
	NEEDS: 'red',
	WANTS: 'yellow',
	REVENUES: 'green'
};

const initialState: State = {
	labels: {
		saving: 'Savings',
		needs: 'Needs',
		wants: 'Wants',
		revenues: 'Revenues'
	},
	savingValue: 0,
	needsValue: 0,
	wantsValue: 0,
	revenuesValue: 0,
	nodes: [
		{
			id: ids.REVENUES,
			nodeColor: 'green',
			type: 'REVENUES'
		},
		{
			id: ids.NEEDS,
			nodeColor: 'red',
			type: 'NEEDS'
		},
		{
			id: ids.WANTS,
			nodeColor: 'yellow',
			type: 'WANTS'
		},
		{
			id: ids.SAVINGS,
			nodeColor: 'blue',
			type: 'SAVINGS'
		}
	],
	links: [
		{
			source: ids.REVENUES,
			target: ids.NEEDS,
			value: 0
		},
		{
			source: ids.REVENUES,
			target: ids.WANTS,
			value: 0
		},
		{
			source: ids.REVENUES,
			target: ids.SAVINGS,
			value: 0
		}
	]
};

export const useStore = create<State & Actions>()(
	immer((set) => ({
		...initialState,
		setNode: (id, name, value, type) => {
			set((state) => {
				const exist = state.nodes.find((node) => node.id === id);

				if (state.labels[id] !== name) {
					state.labels[id] = name;
				}

				value = isNaN(value) ? 0 : value;

				if (!exist) {
					state.nodes.push({
						id,
						nodeColor: colors[type],
						type,
						isNode: true
					});
					if (type === 'REVENUES') {
						state.links.push({
							source: id,
							target: ids.REVENUES,
							value
						});
					} else if (type !== 'SAVINGS') {
						state.links.push({
							source: ids[type],
							target: id,
							value
						});
					} else {
						console.log('SAVING', {
							source: ids.SAVINGS,
							target: id,
							value: 0,
							percent: value
						});
						state.links.push({
							source: ids.SAVINGS,
							target: id,
							value: 0,
							percent: value
						});
					}
				} else if (type !== 'SAVINGS') {
					state.links = state.links.map((link) => {
						if (type === 'REVENUES' && link.source === id) {
							link.value = value;
						}
						if (type !== 'REVENUES' && link.target === id) {
							link.value = value;
						}
						return link;
					});
				}

				state.revenuesValue = Math.max(state.links
					.filter((link) => link.target === ids.REVENUES)
					.reduce((acc, cur) => acc + (cur.value ?? 0), 0), 0);

				state.needsValue = Math.max(state.links
					.filter((link) => link.source === ids.NEEDS)
					.reduce((acc, cur) => acc + (cur.value ?? 0), 0), 0);

				state.wantsValue = Math.max(state.links
					.filter((link) => link.source === ids.WANTS)
					.reduce((acc, cur) => acc + (cur.value ?? 0), 0), 0);

				state.savingValue = Math.max(state.revenuesValue - state.needsValue - state.wantsValue, 0);

				state.links = state.links.map((link) => {
					if (link.source === ids.REVENUES) {
						switch (link.target) {
							case ids.NEEDS:
								link.value = state.needsValue;
								break;
							case ids.WANTS:
								link.value = state.wantsValue;
								break;
							case ids.SAVINGS:
								link.value = state.savingValue;
								break;
						}
					} else if (link.source === ids.SAVINGS) {
						if (link.target === id) {
							link.percent = value;
						}
						link.value = state.savingValue * (link.percent ?? 0) / 100;
					}
					return link;
				});
			});
		},
		removeNode: (id) => {
			set((state) => {
				state.nodes = state.nodes.filter((node) => node.id !== id);
				state.links = state.links.filter((link) => link.source !== id && link.target !== id);
				delete state.labels[id];
			});
		},
		getNodeValue: (id): number => {
			const link = useStore.getState().links.find((link) => link.target === id || link.source === id);
			return link?.percent !== undefined ? link.percent : link?.value ?? 0;
		},
		updateLinkValue: (source, target, value) => {
			set((state) => {
				state.links = state.links.map((link) => {
					if (link.source === source && link.target === target) {
						link.value = value;
					}
					return link;
				});
			});
		},
		importData: (data) => {
			set((state) => {
				state.labels = data.labels;
				state.savingValue = data.savingValue;
				state.needsValue = data.needsValue;
				state.wantsValue = data.wantsValue;
				state.revenuesValue = data.revenuesValue;
				state.nodes = data.nodes;
				state.links = data.links;
			});
		}
	}))
);

export function generateJSON() {
	const {nodes, links, labels, savingValue, needsValue, wantsValue, revenuesValue} = useStore.getState();
	const data = JSON.stringify({
		nodes,
		links,
		labels,
		savingValue,
		needsValue,
		wantsValue,
		revenuesValue
	});
	const blob = new Blob([data], {type: 'application/json'});
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'data.json';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}