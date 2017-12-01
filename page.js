import { Plug } from '/mindtouch-http.js/plug.js';
import { ProgressPlug } from '/mindtouch-http.js/progressPlug.js';
import { Settings } from './lib/settings.js';
import { utility } from './lib/utility.js';
import { modelParser } from './lib/modelParser.js';
import { PageBase } from './pageBase.js';
import { valid, required, one, equals, number } from './lib/validation.js';
import { pageModel } from './models/page.model.js';
import { subpagesModel } from './models/subpages.model.js';
import { pageContentsModel } from './models/pageContents.model.js';
import { pageTreeModel } from './models/pageTree.model.js';
import { pageRatingModel } from './models/pageRating.model.js';
import { pageMoveModel } from './models/pageMove.model.js';
import { pageRatingsModel } from './models/pageRatings.model.js';
import { pageDeleteModel } from './models/pageDelete.model.js';
import { importArchiveModel } from './models/importArchive.model.js';
import { pageExportModel } from './models/pageExport.model.js';
import { pageFindModel } from './models/pageFind.model.js';
import { pageLinkDetailsModel } from './models/pageLinkDetails.model.js';
import { healthReportModel } from './models/healthReport.model.js';
import { templateListModel } from './models/templateList.model.js';
import { popularPagesModel } from './models/popularPages.model.js';
import { pageHierarchyInfoModel } from './models/pageHierarchyInfo.model.js';
import { apiErrorModel } from './models/apiError.model.js';

const _errorParser = modelParser.createParser(apiErrorModel);

/**
 * A class for managing a published page.
 */
export class Page extends PageBase {

    /**
     * Construct a new Page.
     * @param {Number|String} [id='home'] The numeric page ID or the page path.
     * @param {Settings} [settings] - The {@link Settings} information to use in construction. If not supplied, the default settings are used.
     */
    constructor(id = 'home', settings = new Settings()) {
        super(id);
        this._settings = settings;
        this._plug = new Plug(settings.host, settings.plugConfig).at('@api', 'deki', 'pages', this._id);
    }

    /**
     * Gets the basic page information.
     * @param {Object} [params] - Additional parameters to direct the API request.
     * @returns {Promise.<pageModel>} - A Promise that, when resolved, yields a {@link pageModel} containing the basic page information.
     */
    getInfo(params = {}) {
        let infoParams = { exclude: 'revision' };
        Object.keys(params).forEach((key) => {
            infoParams[key] = params[key];
        });
        let pageModelParser = modelParser.createParser(pageModel);
        return this._plug.at('info').withParams(infoParams).get().then((r) => r.json()).then(pageModelParser);
    }

    /**
     * Get the subpages of the page.
     * @param {Object} [params] - Additional parameters to direct the API request.
     * @returns {Promise.<subpagesModel>} - A Promise that, when resolved, yields a {@link subpagesModel} containing the basic page information.
     */
    getSubpages(params) {
        return this._plug.at('subpages').withParams(params).get().then((r) => r.json()).then(modelParser.createParser(subpagesModel));
    }

    /**
     * Get a hierarchy tree based on the current page.
     * @param {Object} [params] - Additional parameters to direct the API request.
     * @returns {Promise.<pageTreeModel>} - A Promise that, when resolved, yields a {@link pageTreeModel} containing the basic page information.
     */
    getTree(params) {
        let pageTreeModelParser = modelParser.createParser(pageTreeModel);
        return this._plug.at('tree').withParams(params).get().then((r) => r.json()).then(pageTreeModelParser);
    }

    /**
     * Get the hierarchical list of pages IDs from the current page to the home page.
     * @returns {Promise.<Array>} - The array of hierarchical page IDs.
     */
    getTreeIds() {
        return this._plug.at('tree').withParam('format', 'ids').get().then((r) => r.text()).then((idString) => {
            return idString.split(',').map((id) => {
                let numId = parseInt(id, 10);
                if(isNaN(numId)) {
                    throw new Error('Unable to parse the tree IDs.');
                }
                return numId;
            });
        }).catch((e) => {
            return Promise.reject({ message: e.message });
        });
    }

    /**
     * Gets the rating information for the page.
     * @returns {Promise.<pageRatingModel>} - A Promise that, when resolved, yields a {@link pageRatingModel} containing the rating information.
     */
    getRating() {
        return this._plug.at('ratings').get().then((r) => r.json()).then(modelParser.createParser(pageRatingModel));
    }

    /**
     * Set the rating for the page.
     * @param {Number|null} [rating=null] - The new rating for the page.
     * @param {Number|null} [oldRating=null] - The old rating for the page that is being replaced by {@see rating}.
     * @returns {Promise.<pageRatingModel>} - A Promise that, when resolved, yields a {@link pageRatingModel} containing the new rating information.
     */
    rate(rating = null, oldRating = null) {
        if(rating !== 1 && rating !== 0 && rating !== null) {
            throw new Error('Invalid rating supplied');
        }
        if(oldRating !== 1 && oldRating !== 0 && oldRating !== null) {
            throw new Error('Invalid rating supplied for the old rating');
        }
        if(rating === null) {
            rating = '';
        }
        if(oldRating === null) {
            oldRating = '';
        }
        return this._plug.at('ratings').withParams({ score: rating, previousScore: oldRating }).post(null, utility.textRequestType).then((r) => r.json()).then(modelParser.createParser(pageRatingModel));
    }

    /**
     * Gets a MindTouch template rendered in the context of the current page, as HTML.
     * @param {String} path - The template path.
     * @param {Object} [params] - Additional parameters to direct the API request.
     * @returns {Promise.<pageContentsModel>} - A Promise that, when resolved, yields the rendered HTML within a {@link pageContentsModel}.
     */
    getHtmlTemplate(path, params = {}) {
        params.pageid = this._id;

        // Double-URL-encode the path and add '=' to the beginning.  This makes
        //  it a proper page ID to be used in a URI segment.
        let templatePath = '=' + encodeURIComponent(encodeURIComponent(path));
        let contentsPlug = new Plug(this._settings.host, this._settings.plugConfig).at('@api', 'deki', 'pages', templatePath, 'contents').withParams(params);
        let pageContentsModelParser = modelParser.createParser(pageContentsModel);
        return contentsPlug.get().then((r) => r.json()).then(pageContentsModelParser);
    }

    /**
     * Copy a page to a specified location
     * @param {Object} params - The params that direct the copy operation.
     * @param {String} params.to - The new page location including the path and name of the page.
     * @param {String} [params.title] - Set the title of the page. If not specified, default to the original title.
     * @param {Boolean} [params.tags=true] - Copy the tags of the page on copy.
     * @param {Boolean} [params.attachments=true] - Copy the attachments of the page on copy.
     * @param {Boolean} [params.recursive=false] - Copy the child hierarchy of the original page.
     * @param {String} [params.abort='exists'] - Specifies condition under which to prevent the update. Allowed values are 'exists' and 'never'.
     * @param {String} [params.allow] - Specifies condition under which to allow the update when an error would normally be thrown.
     * @returns {Promise.<pageMoveModel>} - A Promise that, when resolved, yields a {@link pageMoveModel} containing information regarding the move operation.
     */
    copy(params = {}) {
        if(!params.to) {
            return Promise.reject(new Error('The copy target location must be specified in the `to` parameter.'));
        }
        return this._plug.at('copy')
            .withParams(params)
            .post(null, utility.textRequestType)
            .then((r) => r.json())
            .then(modelParser.createParser(pageMoveModel))
            .catch((err) => Promise.reject(_errorParser(err)));
    }

    /**
     * Move a page to a new location in the hierarchy.
     * @param {Object} [params] - Additional parameters to direct the API request.
     * @returns {Promise.<pageMoveModel>} - A Promise that, when resolved, yields a {@link pageMoveModel} containing information regarding the move operation.
     */
    move(params = {}) {
        return this._plug.at('move')
            .withParams(params)
            .post(null, utility.textRequestType)
            .then((r) => r.json())
            .then(modelParser.createParser(pageMoveModel))
            .catch((err) => Promise.reject(_errorParser(err)));
    }

    /**
     * Delete a page
     * @param {Boolean} [recursive=false] - Indicates whether or not the delete operation will also delete all child pages.
     * @returns {Promise.<pageDeleteModel>} - A Promise that, when resolved, yields a {@link pageDeleteModel} containing information regearding pages that were deleted.
     */
    delete(recursive = false) {
        const pageDeleteModelParser = modelParser.createParser(pageDeleteModel);
        return this._plug.withParam('recursive', recursive).delete().then((r) => r.json()).then(pageDeleteModelParser);
    }

    /**
     * Using the current page, activates a draft; copying the page's content and attachments.
     * @returns {Promise.<pageModel>} - A Promise that, when resolved, yields a {@link pageModel} containing the page information following the activation.
     */
    activateDraft() {
        let pageModelParser = modelParser.createParser(pageModel);
        return this._plug.at('activate-draft').post().then((r) => r.json()).then(pageModelParser);
    }

    /**
     * Import a MindTouch archive file as a child node of the page.
     * @param {File} file - A File object that either represents the file to import, or contains information about the upload target.
     * @param {Object} [options] - The file information options that is, by default populated from the `file` parameter.
     * @param {Object} [params] - Additional API parameters to send along with the request.
     * @returns {Promise.<Object>} - A Promise that will be resolved with the import info data, or rejected with an error specifying the reason for rejection.
     */
    importArchive(file, { name = file.name, size = file.size, type = file.type, progress = null } = {}, params = {}) {
        const apiParams = Object.assign({ filename: name, behavior: 'async' }, params);
        if(progress !== null) {
            const progressPlug = new ProgressPlug(this._settings.host, this._settings.plugConfig).at('@api', 'deki', 'pages', this._id);
            const progressInfo = { callback: progress, size };
            return progressPlug.at('import').withParams(apiParams).put(file, type, progressInfo)
                .then((r) => JSON.parse(r.responseText))
                .catch((e) => Promise.reject(JSON.parse(e.responseText)))
                .then(modelParser.createParser(importArchiveModel));
        }
        return this._plug.withHeader('Content-Length', size).withParams(apiParams).at('import').put(file, type)
            .then((r) => r.json())
            .catch((e) => Promise.reject(JSON.parse(e.responseText)))
            .then(modelParser.createParser(importArchiveModel));
    }

    /**
     * Generates the information so that clients can stream down the exported page(s) in mtarc format.
     * @returns {Promise.<Object>} - A Promise that will be resolved with data describing the exported file, or rejected with an error specifying the reason for rejection.
     */
    getExportInformation() {
        return this._plug.at('export').post(null, utility.textRequestType).then((r) => r.json()).then(modelParser.createParser(pageExportModel));
    }

    /**
     * Export the page as a PDF.
     * @param {Object} [options] Options to direct the fetching of the PDF.
     * @param {String} [options.filename] The filename to save the PDF as.  If not supplied, uses the page's title.
     * @param {String} [options.format=pdf] The format to export. Must be one of "pdf" or "html".
     * @param {String} [options.stylesheet] The name of a custom stylesheet to apply.
     * @param {Boolean} [options.deep=false] If true, exports the page and all of its subpages.
     * @param {Boolean} [options.showToc=false] If true, includes a table of contents in the exported document.
     * @param {Boolean} [options.dryRun=false] If true, perform a simulated export to verify if an actual, subsequent export will be successful.
     * @returns {Promise} A Promise that when resolved, indicates that the export has completed successfully. If dryRun was set to false, the Promise resolution will provide a Blob containing the PDF contents.
     */
    exportPdf({ fileName, format = 'pdf', stylesheet, deep = false, showToc = false, dryRun = false } = {}) {
        const params = {};
        if(fileName) {
            if(typeof fileName !== 'string') {
                return Promise.reject(new Error('The fileName parameter must be a non-empty string'));
            }
            params.filename = fileName;
        }
        if(stylesheet) {
            if(typeof stylesheet !== 'string') {
                return Promise.reject(new Error('The stylesheet parameter must be a non-empty string'));
            }
            params.stylesheet = stylesheet;
        }
        if(format !== 'pdf' && format !== 'html') {
            return Promise.reject(new Error('The `format` parameter must be either "pdf" or "html".'));
        }
        params.format = format;
        if(typeof deep !== 'boolean') {
            return Promise.reject(new Error('The `deep` parameter must be a Boolean value.'));
        }
        params.deep = deep;
        if(typeof showToc !== 'boolean') {
            return Promise.reject(new Error('The `showToc` parameter must be a Boolean value.'));
        }
        params.showtoc = showToc;
        if(typeof dryRun !== 'boolean') {
            return Promise.reject(new Error('The `dryRun` parameter must be a Boolean value.'));
        }
        params.dryrun = dryRun;
        const respPromise = this._plug.at('pdf').withParams(params).get();
        if(dryRun) {
            return respPromise;
        }
        return respPromise.then((r) => r.blob());
    }

    /**
     * Set the order in which this page will occur in relation to its siblings.
     * @param {Number} afterId The page id after which this page should be placed. Defaults to 0 to place it at the beginning.
     * @returns {Promise} A Promise that, when resolved, indicates that the reorder operation succeeded.
     */
    setOrder(afterId = 0) {
        if(typeof afterId !== 'number') {
            return Promise.reject(new Error('The afterId must be a numeric page ID.'));
        }
        return this._plug.at('order').withParam('afterId', afterId).put();
    }

    /**
     * Retrieve the links that are in the page.
     * @param {Object} [options] Options to direct the fetching of the page's links.
     * @param {Boolean} [options.includeSubpages=false] Return information about links in subpages.
     * @param {Array} [options.linkTypes] An array of the link types to include ("broken" only if not specified).
     * @param {Boolean} [options.broken] The broken state of the links to include.
     * @param {Boolean} [options.redirect] The redirect state of the links to include.
     * @param {Number} [options.limit] The maximum number of results to return.
     * @param {Number} [options.offset] The number of items to skip.
     * @param {String} [options.q] A search query string
     * @returns {Promise} A Promise that, when resolved, returns a pageLinkDetailsModel with the list of link details that were fetched.
     */
    getLinkDetails({ includeSubpages = false, linkTypes = [], broken, redirect, limit = 100, offset = 0, q } = {}) {
        const params = {};
        if(typeof includeSubpages !== 'boolean') {
            return Promise.reject(new Error('The `includeSubpages` parameter must be a Boolean value.'));
        }
        params.subpages = includeSubpages;
        if(!Array.isArray(linkTypes)) {
            return Promise.reject(new Error('The `linkTypes` parameter must be an array.'));
        }
        if(linkTypes.length > 0) {
            params.linktypes = linkTypes.join(',');
        }
        if(typeof broken !== 'undefined') {
            if(typeof broken !== 'boolean') {
                return Promise.reject(new Error('The `broken` parameter must be a Boolean value.'));
            }
            params.broken = broken;
        }
        if(typeof redirect !== 'undefined') {
            if(typeof redirect !== 'boolean') {
                return Promise.reject(new Error('The `redirect` parameter must be a Boolean value.'));
            }
            params.redirect = redirect;
        }
        if(typeof limit !== 'number') {
            return Promise.reject(new Error('The `limit` parameter must be a number.'));
        }
        params.limit = limit;
        if(typeof offset !== 'number') {
            return Promise.reject(new Error('The `offset` parameter must be a number.'));
        }
        params.offset = offset;
        if(typeof q !== 'undefined') {
            if(typeof q !== 'string') {
                return Promise.reject(new Error('The `q` parameter must be a string.'));
            }
            params.q = q;
        }
        return this._plug.at('linkdetails').withParams(params).get()
            .catch((err) => Promise.reject(_errorParser(err)))
            .then((r) => r.json())
            .then(modelParser.createParser(pageLinkDetailsModel));
    }

    /**
     * Get a listing of health inspections for a page.
     * @param {Object} [options] Options to direct the fetching of the health inspections.
     * @param {Array} [options.analyzers] An array of analyzers to include in the report (all analyzers included if not specified)
     * @param {Array} [options.severities] An array of severity levels to include in the report (all levels included if none specified)
     * @param {Array} [options.includeSubpages] Indicates whether or not to include the subpages in the report.
     * @param {Array} [options.limit] The maximum number of health reports to include.
     * @param {Array} [options.offset] The number of items to skip.
     * @returns {Promise} A Promise that, when resolved, yields a healthReportModel with the listing of health inspections for the page.
     */
    getHealthInspections({ analyzers, severities, includeSubpages, limit, offset } = {}) {
        const params = {};
        if(analyzers) {
            if(!Array.isArray(analyzers)) {
                return Promise.reject(new Error('The `analyzers` parameter must be an array.'));
            }
            params.analyzers = analyzers.join(',');
        }
        if(severities) {
            if(!Array.isArray(severities)) {
                return Promise.reject(new Error('The `severities` parameter must be an array.'));
            }
            params.severity = severities.join(',');
        }
        if(typeof includeSubpages !== 'undefined') {
            if(typeof includeSubpages !== 'boolean') {
                return Promise.reject(new Error('The `includeSubpages` parameter must be a boolean value.'));
            }
            params.subpages = includeSubpages;
        }
        if(limit) {
            if(typeof limit !== 'number') {
                return Promise.reject(new Error('The `limit` parameter must be a number.'));
            }
            params.limit = limit;
        }
        if(offset) {
            if(typeof offset !== 'number') {
                return Promise.reject(new Error('The `offset` parameter must be a number.'));
            }
            params.offset = offset;
        }
        return this._plug.at('health').withParams(params).get()
            .catch((err) => Promise.reject(_errorParser(err)))
            .then((r) => r.json())
            .then(modelParser.createParser(healthReportModel));
    }

    /**
     * Retrieves the count of pages and attachments within a hierarchy
     * @returns {Promise} A Promise that, when resolved, yields the hierachy count information.
     */
    getHierarchyInfo() {
        return this._plug.at('hierarchyinfo').get()
            .then((r) => r.json())
            .then(modelParser.createParser(pageHierarchyInfoModel));
    }
}

/**
 * A class for managing all of the published pages on a site.
 */
export class PageManager {
    constructor(settings = new Settings()) {
        this._plug = new Plug(settings.host, settings.plugConfig).at('@api', 'deki', 'pages');
    }

    /**
     * Get the ratings that have been set for a series of pages.
     * @param {Array} pageIds - The list of pages for which ratings data is fetched.
     * @returns {Promise.<pageRatingsModel>} - A Promise that, when resolved, yields a {@link pageRatingsModel} object with the ratings information.
     */
    getRatings(pageIds) {
        const ratingsPlug = this._plug.at('ratings').withParams({ pageids: pageIds.join(',') });
        return ratingsPlug.get().then((r) => r.json()).then(modelParser.createParser(pageRatingsModel));
    }

    /**
     * Find pages based on supplied constraints
     * @param {Object} options - The options to direct the results of the find operation.
     * @param {Number|String} [options.parentId=home] - The parent ID of the hierarchy to search. Either a numeric page ID or a page path string.
     * @param {Array} [options.tags=[]] - An array of tags that the found pages must contain.
     * @param {Array} [options.missingClassifications=[]] - An array of classification prefixes that must not exist on the pages.
     * @param {Date} [options.since] - Find pages last modified since this date.
     * @param {Date} [options.upTo=Date.now()] - Find pages last modified up to this date.
     * @returns {Promise.<Object>} - A Promise that will be resolved with the results of the find request, or rejected with an error specifying the reason for rejection.
     */
    findPages(options = {}) {
        let paramFound = false;
        const params = {};
        if(options.parentId) {
            params.parentid = utility.getResourceId(options.parentId, 'home');
            paramFound = true;
        }
        if(options.tags) {
            if(!Array.isArray(options.tags)) {
                return Promise.reject(new Error('The `tags` parameter must be an Array.'));
            }
            if(options.tags.length > 0) {
                params.tags = options.tags.join(',');
                paramFound = true;
            }
        }
        if(options.missingClassifications) {
            if(!Array.isArray(options.missingClassifications)) {
                return Promise.reject(new Error('The `missingClassifications` parameter must be an Array.'));
            }
            if(options.missingClassifications.length > 0) {
                params.missingclassifications = options.missingClassifications.join(',');
                paramFound = true;
            }
        }
        if(options.since) {
            if(!(options.since instanceof Date)) {
                return Promise.reject(new Error('The `since` parameter must be of type Date.'));
            }
            params.since = utility.getApiDateString(options.since);
            paramFound = true;
        }
        if(options.upTo) {
            if(!(options.upTo instanceof Date)) {
                return Promise.reject(new Error('The `upTo` parameter must be of type Date.'));
            }
            params.upto = utility.getApiDateString(options.upTo);
            paramFound = true;
        }
        if(paramFound === false) {
            return Promise.reject(new Error('At least one constraint must be supplied to find pages.'));
        }
        return this._plug.at('find')
            .withParams(params)
            .get()
            .then((r) => r.json())
            .catch((err) => Promise.reject(_errorParser(err)))
            .then(modelParser.createParser(pageFindModel));
    }

    /**
     * Get the templates that may be used to create new pages or insert content.
     * @param {Object} [options] Options to direct the templates that are returned.
     * @param {String} [options.type=page] The type of the templates to retrun. Must be one of either "page" or "content".
     * @param {Boolean} [options.includeDescription=true] Whether or not to include the template descriptions.
     * @returns {Promise} A Promise that, when resolved returns a listing of the available templates.
     */
    getTemplates({ type = 'page', includeDescription = true } = {}) {
        if(typeof type !== 'string' || (type !== 'page' && type !== 'content')) {
            return Promise.reject(new Error('The `type` parameter must be set to either "page" or "content".'));
        }
        if(typeof includeDescription !== 'boolean') {
            return Promise.reject(new Error('The `includeDescription` parameter must be a Boolean value'));
        }
        return this._plug.at('templates').withParams({ type, includeDescription }).get()
            .then((r) => r.json())
            .then(modelParser.createParser(templateListModel));
    }

    /**
     * Retrieves a list of popular pages on the site.
     * @param {Object} [options] Options to direct the fetching of the popular pages.
     * @param {Number|String} [options.limit=50] The number of results to return. Can be set to the string "all" to return all results.
     * @param {Number} [options.offset=0] The number of results to skip.
     * @returns {Promise} A Promise that, when resolved, yields a listing of popular pages.
     */
    getPopularPages({ limit = 50, offset = 0 } = {}) {
        const optionsErrors = valid.object({ limit, offset },
            required('limit', one(number(), equals('all'))),
            required('offset', number())
        );
        if(optionsErrors.length > 0) {
            return Promise.reject(optionsErrors.join(', '));
        }
        return this._plug.at('popular').withParams({ limit, offset }).get()
            .then((r) => r.json())
            .then(modelParser.createParser(popularPagesModel));
    }
}
