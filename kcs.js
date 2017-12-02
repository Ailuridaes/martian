import { Plug } from '/mindtouch-http.js/plug.js';
import { Settings } from './lib/settings.js';
import { modelParser } from './lib/modelParser.js';
import { apiErrorModel } from './models/apiError.model.js';
import { kcsTransitionsModel } from './models/kcsTransitions.model.js';
import { kcsStateModel } from './models/kcsState.model.js';

const _errorParser = modelParser.createParser(apiErrorModel);

/**
 * A class for handling KCS actions
 */
export class Kcs {

    /**
     * Construct a Kcs object
     * @param {Settings} [settings] - The {@link Settings} information to use in construction. If not supplied, the default settings are used.
     */
    constructor(settings = new Settings()) {
        this._plug = new Plug(settings.host, settings.plugConfig).at('@api', 'deki', 'kcs');
    }

    /**
     * Retrieves the current KCS state of a page
     * @param {Number|String} pageid The ID of the page to request the current KCS state for.
     * @returns {Promise} A Promise that, when resolved, yields a kcsStateModel.
     */
    getState(pageid) {
        if(!pageid) {
            return Promise.reject('Page ID must be specified for request.');
        }
        return this._plug.at(pageid, 'state').get()
            .then((r) => r.json())
            .then(modelParser.createParser(kcsStateModel));
    }

    /**
     * Retrieves a list of allowed KCS transitions for a page
     * @param {Number|String} pageid The ID of the page to request valid KCS transitions for.
     * @returns {Promise} A Promise that, when resolved, yields a kcsTransitionsModel with a list of allowed KCS transitions.
     */
    getValidTransitions(pageid) {
        if(!pageid) {
            return Promise.reject('Page ID must be specified for request.');
        }
        return this._plug.at(pageid, 'validtransitions').get()
            .then((r) => r.json())
            .then(modelParser.createParser(kcsTransitionsModel));
    }

    /**
     * Posts KCS state for given page
     * @param {Number|String} pageid The ID of the page to set a new state on.
     * @param {Object} state The state that the page should be set to. Can include confidence or visibility or both.
     * @param {String} [state.confidence] The confidence level to set the page to.
     * @param {String} [state.visibility] The visibility level to set the page to.
     * @returns {Promise} A Promise that is resolved, or rejected with an error specifying the reason for rejection.
     */
    setState(pageid, state) {
        if(!pageid) {
            return Promise.reject('Page ID must be specified for request.');
        }
        if(!state.confidence && !state.visibility) {
            return Promise.reject('Page confidence or visibility state must be specified for request.');
        }
        return this._plug.at(pageid, 'state').withParams(state).post();
    }

    /**
     * Sets KCS flag state the current page to true
     * @param {Number|String} pageid The ID of the page to set a new state on.
     * @returns {Promise} A Promise that is resolved, or rejected with an error specifying the reason for rejection.
     */
    flag(pageid) {
        if(!pageid) {
            return Promise.reject('Page ID must be specified for request.');
        }
        return this._plug.at(pageid, 'flag').post();
    }

    /**
     * Sets KCS flag state the current page to true
     * @param {Number|String} pageid The ID of the page to set a new state on.
     * @returns {Promise} A Promise that is resolved, or rejected with an error specifying the reason for rejection.
     */
    unflag(pageid) {
        if(!pageid) {
            return Promise.reject('Page ID must be specified for request.');
        }
        return this._plug.at(pageid, 'unflag').post();
    }
}