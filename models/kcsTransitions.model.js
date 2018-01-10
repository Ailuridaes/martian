import { kcsStateModel } from './kcsState.model.js';

export const kcsTransitionsModel = [
    {
        field: 'transitions',
        transform: [
            { field: 'state', name: 'states', isArray: true, transform: kcsStateModel }
        ]
    },
    { field: 'can-change-governance', name: 'canChangeGovernance', transform: 'boolean' },
    { field: 'can-change-flag', name: 'canChangeFlag', transform: 'boolean' }
];
