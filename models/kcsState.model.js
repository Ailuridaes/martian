const attributeModel = [
    { field: '@label', name: 'label' },
    { field: 'value' },
    { field: 'value-label', name: 'valueLabel' }
];

export const kcsStateModel = [
    { field: 'confidence', transform: attributeModel },
    { field: 'flag', transform: attributeModel },
    { field: 'governance', transform: attributeModel },
    { field: 'visibility', transform: attributeModel }
];
