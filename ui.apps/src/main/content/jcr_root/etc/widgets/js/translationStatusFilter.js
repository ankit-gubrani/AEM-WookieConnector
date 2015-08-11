/**
 * @return {string}
 */
CQ.wcm.TLAdmin.PageStatus = function (record) {
    var not_translated, translated, in_translation, outdated;
    var status = record.json.status;
    var flagClass = "";
    if (status === 'translated') {
        flagClass = "status status-translated";
    } else if (status === 'in_translation') {
        flagClass = "status status-intranslation";
    } else if (status === 'outdated') {
        flagClass = "status status-outdated";
    } else {
        flagClass = "status status-none";
    }
    return flagClass;
};

CQ.wcm.TLAdmin.filter = function () {

    var fetchContent = function (filterName, language) {
        var transAdminGrid = CQ.Ext.getCmp('cq-tladmin-grid');
        var store = transAdminGrid.getStore();
        if (filterName !== 'noFilter') {
            store.proxy.api.read.url = "/bin/pageFilter.json?filterName=" + filterName + "&searchPath=/content&pageLanguage=" + language;
        } else {
            var path = window.location.hash;
            var gridPath = path ? path.substring(1) : "/content";
            var requestType = path && path.indexOf("/dam") !== -1 ? "assets" : "pages";
            //var gridCfg = tlAdminGrid.getGridConfig(gridPath);
            store.proxy.api.read.url = "/bin/fetchGridPages?path=" + gridPath + "&type=" + requestType;
        }
        var mask = new CQ.Ext.LoadMask(CQ.Ext.getBody(), {
            msg: "Loading content : please wait....."
        });
        mask.show();
        store.load({
            scope: this,
            callback: function(records, operation, success) {
                if (success) {
                    translationAdmin.pagingToolbar.bindStore(store);
                    translationAdmin.pagingToolbar.pageSize = CQ.themes.wcm.SiteAdmin.GRID_PAGE_SIZE;
                    translationAdmin.checkPagingToolbar(store.totalLength);
                    mask.hide();
                }
            }
        });
    }
    return {
        getAll: function (language) {
            fetchContent("noFilter", language);
        },
        getTranslated: function (language) {
            fetchContent("translated", language);
        },
        getOutdated: function (language) {
            fetchContent("outdated", language);
        },
        getNotTranslated: function (language) {
            fetchContent("not_translated", language);
        },
        getInTranslation: function (language) {
            fetchContent("in_translation", language);
        }
    }
}();