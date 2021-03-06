/* eslint-env jasmine, jest */
jest.unmock('../group.js');
import { GroupManager, Group } from '../group.js';

describe('Group API', () => {
    let gm = null;
    beforeEach(() => {
        gm = new GroupManager();
    });
    afterEach(() => {
        gm = null;
    });
    describe('GroupManager', () => {
        it('can get the listing of all of the groups (no params)', () => {
            return gm.getGroupList();
        });
        it('can get the listing of all of the groups (all params)', () => {
            return gm.getGroupList({
                nameFilter: 'foo',
                authProvider: 4,
                limit: 1000,
                offset: 100,
                sortBy: 'id'
            });
        });
        it('can get the listing of all of the groups (limit=all)', () => {
            return gm.getGroupList({ limit: 'all' });
        });
        it('can get the listing of all of the groups (empty nameFilter)', () => {
            return gm.getGroupList({ nameFilter: '' });
        });
        it('can fail getting the groups listing with an invalid nameFilter', () => {
            const success = jest.fn();
            return gm.getGroupList({ nameFilter: 123 }).then(() => {
                success();
                throw new Error('Promise was resolved');
            }).catch(() => {
                expect(success).not.toHaveBeenCalled();
            });
        });
        it('can fail getting the groups listing with an invalid authProvider', () => {
            const success = jest.fn();
            return gm.getGroupList({ authProvider: '123' }).then(() => {
                success();
                throw new Error('Promise was resolved');
            }).catch(() => {
                expect(success).not.toHaveBeenCalled();
            });
        });
        it('can fail getting the groups listing with an invalid limit', () => {
            const success = jest.fn();
            return gm.getGroupList({ limit: '123' }).then(() => {
                success();
                throw new Error('Promise was resolved');
            }).catch(() => {
                expect(success).not.toHaveBeenCalled();
            });
        });
        it('can fail getting the groups listing with an invalid offset', () => {
            const success = jest.fn();
            return gm.getGroupList({ offset: '123' }).then(() => {
                success();
                throw new Error('Promise was resolved');
            }).catch(() => {
                expect(success).not.toHaveBeenCalled();
            });
        });
        it('can fail getting the groups listing with an invalid sortBy (wrong type)', () => {
            const success = jest.fn();
            return gm.getGroupList({ sortBy: 123 }).then(() => {
                success();
                throw new Error('Promise was resolved');
            }).catch(() => {
                expect(success).not.toHaveBeenCalled();
            });
        });
        it('can fail getting the groups listing with an invalid sortBy (wrong value)', () => {
            const success = jest.fn();
            return gm.getGroupList({ sortBy: '123' }).then(() => {
                success();
                throw new Error('Promise was resolved');
            }).catch(() => {
                expect(success).not.toHaveBeenCalled();
            });
        });
        it('can get a Group object by ID', () => {
            let group = gm.getGroup(132);
            expect(group).toBeDefined();
        });
    });
    describe('Group constructor', () => {
        it('can construct a new Group object from the group ID', () => {
            let group = new Group(2);
            expect(group).toBeDefined();
        });
        it('can construct a new Group object from the group name', () => {
            let group = new Group('foo');
            expect(group).toBeDefined();
        });
        it('can fail gracefully when no group ID is provided', () => {
            expect(() => new Group()).toThrow();
            expect(() => Group()).toThrow();
        });
    });
    describe('group functionality', () => {
        let group = null;
        beforeEach(() => {
            group = new Group(2);
        });
        afterEach(() => {
            group = null;
        });
        it('can fetch a single group', () => {
            return group.getInfo();
        });
        it('can fetch a group\'s users', () => {
            return group.getUsers();
        });
        it('can delete a group', () => {
            return group.delete();
        });
        it('can remove a user from a group', () => {
            return group.removeUser(132);
        });
    });
});
