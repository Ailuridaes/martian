import Plug from './lib/plug';
import contextIdsModel from 'models/contextIds.model';
import contextIdModel from 'models/contextId.model';
import contextMapsModel from 'models/contextMaps.model';
import contextMapModel from 'models/contextMap.model';
class ContextDefinition {
    static _getPlug() {
        if(!this.definitionsPlug) {
            this.definitionsPlug = new Plug().at('@api', 'deki', 'contexts');
        }
        return this.definitionsPlug;
    }
    static getDefinitions() {
        return ContextDefinition._getPlug().get().then(contextIdsModel.parse);
    }
    static addDefinition(id, description = '') {
        if(!id) {
            return Promise.reject(new Error('an ID must be supplied to add a definintion'));
        }
        let addRequest = `<contexts><context><id>${id}</id><description>${description}</description></context></contexts>`;
        return ContextDefinition._getPlug().post(addRequest, 'application/xml; charset=utf-8').then(contextIdModel.parse);
    }
    constructor(id) {
        if(!id) {
            throw new Error('an ID must be supplied to create a new ContextDefinition');
        }
        this.id = id;
        this.plug = ContextDefinition._getPlug().at(id);
    }
    getInfo() {
        return this.plug.get().then(contextIdModel.parse);
    }
    updateDescription(description = '') {
        let updateRequest = `<context><id>${this.id}</id><description>${description}</description></context>`;
        return this.plug.put(updateRequest, 'application/xml; charset=utf-8').then(contextIdModel.parse);
    }
    delete() {
        return this.plug.delete();
    }
}
class ContextMap {
    static _getPlug() {
        if(!this.mapsPlug) {
            this.mapsPlug = new Plug().at('@api', 'deki', 'contextmaps').withParam('verbose', 'true');
        }
        return this.mapsPlug;
    }
    static getMaps() {
        return ContextMap._getPlug().get().then(contextMapsModel.parse);
    }
    constructor(language, id) {
        if(!id || !language) {
            throw new Error('an ID and language must be supplied to create a new ContextMap');
        }
        this.id = id;
        this.language = language;
        this.plug = ContextMap._getPlug().at(language, id);
    }
    getInfo() {
        return this.plug.get().then(contextMapModel.parse);
    }
    update(pageId) {
        if(!pageId) {
            return Promise.reject(new Error('a page ID must be supplied in order to update a mapping'));
        }
        let updateRequest = `<contextmap><id>${this.id}</id><pageid>${pageId}</pageid><language>${this.language}</language></contextmap>`;
        return this.plug.put(updateRequest, 'application/xml; charset=utf-8').then(contextMapModel.parse);
    }
    remove() {
        return this.plug.delete();
    }
}
export {ContextDefinition, ContextMap};
