export const kcsStateModel = [
    {
        field: 'visibility', transform: [
            { field: '@label', name: 'label' },
            { field: 'value' },
            { field: 'value-label' }
        ] 
    },
    {
        field: 'confidence', transform: [
            { field: '@label', name: 'label' },
            { field: 'value' },
            { field: 'value-label' }
        ] 
    },
    {
        field: 'flagged', transform: [
            { field: '@label', name: 'label' },
            { field: 'value', transform: 'boolean' },
            { field: 'value-label' }
        ] 
    }
];
