import { kcsStateModel } from './kcsState.model.js';

export const kcsTransitionsModel = [
    {
        field: 'transitions',
        transform: [
            { field: 'state', name: 'states', isArray: true, transform: kcsStateModel }
        ]
    },
    { field: 'canedit', transform: 'boolean' }
];
