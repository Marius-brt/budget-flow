import {create} from 'zustand/index';
import {immer} from 'zustand/middleware/immer';
import {z} from 'zod';
import {convertToSankey, dataSchema, importSchema, SankeyDataType} from '@/lib/schema';
import {set as _set, unset as _unset} from 'lodash-es';

export type NodeIdExclude = 'needs' | 'wants' | 'revenues';

type State = {
	labels: Record<string, string>,
	rawData: z.infer<typeof dataSchema>
	data: SankeyDataType,
	revenuesTotal: number,
	needsTotal: number,
	wantsTotal: number,
	savingTotal: number
}

type Actions = {
	updateLabel: (id: string, label: string) => void,
	updateData: (type: NodeIdExclude, id: string, value: number) => void
	updateSaving: (path: string, percent: number) => void,
	addNode: (label: string, type: NodeIdExclude) => void,
	addSaving: (label: string, path?: string) => void,
	removeNode: (id: string, type: NodeIdExclude) => void,
	deleteSaving: (path: string) => void,
	importData: (data: z.infer<typeof importSchema>) => void
}

const defaultState: State = {
	labels: {
		savings: 'Savings',
		needs: 'Needs',
		wants: 'Wants',
		revenues: 'Revenues'
	},
	rawData: {
		needs: {},
		wants: {},
		revenues: {},
		savings: {}
	},
	revenuesTotal: 0,
	needsTotal: 0,
	wantsTotal: 0,
	savingTotal: 0,
	data: convertToSankey({
		needs: {},
		wants: {},
		revenues: {},
		savings: {}
	}).data
};

export const useStore = create<State & Actions>()(
	immer((set) => ({
		...defaultState,
		updateLabel: (id, label) => {
			set((state) => {
				state.labels[id] = label;
			});
		},
		updateData: (type, id, value) => {
			set((state) => {
				state.rawData[type][id] = value;

				const data = convertToSankey(state.rawData);
				state.savingTotal = data.savingTotal;
				state.revenuesTotal = data.revenuesTotal;
				state.needsTotal = data.needsTotal;
				state.wantsTotal = data.wantsTotal;
				state.data = data.data;
			});
		},
		updateSaving: (path, percent) => {
			set((state) => {
				percent = Math.max(isNaN(percent) ? 0 : percent, 0);
				_set(state.rawData.savings, path + '.percent', percent);

				const data = convertToSankey(state.rawData);
				state.savingTotal = data.savingTotal;
				state.revenuesTotal = data.revenuesTotal;
				state.needsTotal = data.needsTotal;
				state.wantsTotal = data.wantsTotal;
				state.data = data.data;
			});
		},
		addNode: (label, type) => {
			set((state) => {
				const id = Date.now().toString();
				state.rawData[type][id] = 0;
				state.labels[id] = label;
			});
		},
		addSaving: (label, path) => {
			set((state) => {
				const id = Date.now().toString();
				if (path) {
					_set(state.rawData.savings, path + '.subCategories.' + id, {
						percent: 0,
						subCategories: {}
					});
				} else {
					state.rawData.savings[id] = {
						percent: 0,
						subCategories: {}
					};
				}
				state.labels[id] = label;
			});
		},
		removeNode: (id, type) => {
			set((state) => {
				delete state.rawData[type][id];
				delete state.labels[id];

				const data = convertToSankey(state.rawData);
				state.savingTotal = data.savingTotal;
				state.revenuesTotal = data.revenuesTotal;
				state.needsTotal = data.needsTotal;
				state.wantsTotal = data.wantsTotal;
				state.data = data.data;
			});
		},
		deleteSaving: (path) => {
			set((state) => {
				_unset(state.rawData.savings, path);

				const data = convertToSankey(state.rawData);
				state.savingTotal = data.savingTotal;
				state.revenuesTotal = data.revenuesTotal;
				state.needsTotal = data.needsTotal;
				state.wantsTotal = data.wantsTotal;
				state.data = data.data;
			});
		},
		importData: (dt) => {
			set((state) => {
				state.labels = dt.labels;
				state.rawData = dt.rawData;

				const data = convertToSankey(dt.rawData);
				state.savingTotal = data.savingTotal;
				state.revenuesTotal = data.revenuesTotal;
				state.needsTotal = data.needsTotal;
				state.wantsTotal = data.wantsTotal;
				state.data = data.data;
			});
		}
	}))
);

export function generateJSON() {
	const {labels, rawData} = useStore.getState();
	const data = JSON.stringify({
		labels,
		rawData
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