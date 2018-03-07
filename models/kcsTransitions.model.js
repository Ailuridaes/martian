import { kcsStateModel } from './kcsState.model.js';

const attributeModel = [
    { field: '@label', name: 'label' },
    { field: 'value' },
    { field: 'value-label', name: 'valueLabel' }
];

export const kcsTransitionsModel = [
    {
        field: 'transitions',
        transform: [{ field: 'state', name: 'states', isArray: true, transform: kcsStateModel }]
    },
    { field: 'flag', transform: [
        { field: '@label', name: 'label' },
        { field: 'value', transform: 'boolean' },
        { field: 'value-label', name: 'valueLabel' }
    ]},
    { field: 'governance', transform: attributeModel }
];
