/* eslint-env jasmine, jest */
jest.unmock('../kcs.js');
import { Kcs } from '../kcs.js';

describe('Kcs', () => {
    let kcs, pageId;
    beforeEach(() => {
        pageId = 317;
        kcs = new Kcs();
    });
    it('requires a page id to get state', () => {
        expect.assertions(1);
        return expect(kcs.getState()).rejects.toEqual('Page ID must be specified for request.');
    });
    it('can get state', () => {
        return kcs.getState(pageId);
    });
    it('requires a page id to set state', () => {
        expect.assertions(1);
        return expect(kcs.setState()).rejects.toEqual('Page ID must be specified for request.');
    });
    it('requires a state to set state', () => {
        expect.assertions(1);
        return expect(kcs.setState(pageId, {})).rejects.toEqual(
            'Page confidence or visibility state must be specified for request.'
        );
    });
    it('can set state', () => {
        return kcs.setState(pageId, { confidence: 'wip', visibility: 'internal' });
    });
    it('requires a page id to get transitions', () => {
        expect.assertions(1);
        return expect(kcs.getValidTransitions()).rejects.toEqual('Page ID must be specified for request.');
    });
    it('can get transitions', () => {
        return kcs.getValidTransitions(pageId);
    });
});
