/* eslint-env jasmine, jest */
jest.unmock('../pageKcs.js');
import { PageKcs } from '../pageKcs.js';

describe('PageKcs', () => {
    let kcs;
    beforeEach(() => {
        kcs = new PageKcs(317);
    });
    it('can get state', () => {
        return kcs.getState();
    });
    it('requires a state to set state', () => {
        expect.assertions(1);
        return expect(kcs.setState({})).rejects.toEqual('A state must be specified for request.');
    });
    it('can set state', () => {
        return kcs.setState({ confidence: 'wip', visibility: 'internal' });
    });
    it('can get transitions', () => {
        return kcs.getValidTransitions();
    });
    it('can initialize state', () => {
        return kcs.initialize();
    });
    it('can set flag state', () => {
        return kcs.setFlag({ state: true, details: 'Terrible' });
    });
    it('requires a state to set flag state', () => {
        expect.assertions(1);
        return expect(kcs.setFlag({})).rejects.toEqual('A flagged state must be specified for request.');
    });
    it('requires a state to set flag state', () => {
        expect.assertions(1);
        return expect(kcs.setFlag({ state: true })).rejects.toEqual('Details must be specified for request when the flagged state is set to true.');
    });
});
