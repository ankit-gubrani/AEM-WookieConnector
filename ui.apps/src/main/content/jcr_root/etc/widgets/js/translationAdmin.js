var translationAdmin;
CQ.wcm.TLAdmin = CQ.Ext.extend(CQ.Ext.Viewport, {

    constructor: function (config) {
        var admin = this;
        translationAdmin = admin;
        this.title = config.title;
        config = CQ.Util.applyDefaults(config, {
            "id": "cq-tladmin",
            "grid": {
                "pages": {
                    "pathRegex": "(/.*)?",
                    "storeProxyPrefix": "",
                    "storeProxySuffix": ".pages.json",
                    "storePredicate": "siteadmin",
                    "storeReaderTotalProperty": "results",
                    "storeReaderRoot": "pages",
                    "storeReaderId": "path",
                    "storeReaderFields": [
                        "index",
                        "title",
                        CQ.shared.XSS.getXSSPropertyName("title"),
                        "label",
                        "type",
                        "path",
                        "pageLanguage",
                        "languageNiceName",
                        "dialogPath",
                        "translatedTo",
                        "translatedFrom",
                        "hasChildren",
                        "lastModified",
                        "templateTitle",
                        "templateShortTitle",
                        "includeChildren"
                    ],
                    "columns": [
                        CQ.wcm.TLAdmin.COLUMNS["numberer"],
                        CQ.wcm.TLAdmin.COLUMNS["title"],
                        CQ.wcm.TLAdmin.COLUMNS["path"],
                        CQ.wcm.TLAdmin.COLUMNS["pageLanguage"],
                        CQ.wcm.TLAdmin.COLUMNS["status"],
                        CQ.wcm.TLAdmin.COLUMNS["translatedTo"],
                        CQ.wcm.TLAdmin.COLUMNS["translatedFrom"],
                        CQ.wcm.TLAdmin.COLUMNS["hasChildren"],
                        CQ.wcm.TLAdmin.COLUMNS["basketActions"]
                    ],
                    "defaultSortable": true
                }
            }
        });

        // set up grid configs
        var gridCfgs = {};
        for (var name in config.grid) {
            if (!config.grid[name].pathRegex) {
                // reject grid configs without pathRegex
                // to avoid overriding default config
                continue;
            }
            gridCfgs[name] = config.grid[name];
            if (name != "pages") {
                // fill missing options with defaults
                gridCfgs[name] = CQ.Ext.applyIf(gridCfgs[name], config.grid["pages"]);
            }
            if (gridCfgs[name].pageSize == undefined) {
                gridCfgs[name].pageSize = CQ.themes.wcm.SiteAdmin.GRID_PAGE_SIZE;
            }
            if (gridCfgs[name].pageText == undefined) {
                gridCfgs[name].pageText = CQ.themes.wcm.SiteAdmin.GRID_PAGE_TEXT;
            }
            gridCfgs[name].storeConfig = CQ.Util.applyDefaults(config.store, {
                "autoLoad": false,
                "remoteSort": true,
                "listeners": gridCfgs[name].storeListeners,
                "proxy": new CQ.Ext.data.HttpProxy({
                    "api": {
                        "read": {
                            "url": gridCfgs[name].storeProxyPrefix,
                            "method": "GET"
                        }
                    }
                }),
                "reader": new CQ.Ext.data.JsonReader({
                    "totalProperty": gridCfgs[name].storeReaderTotalProperty,
                    "root": gridCfgs[name].storeReaderRoot,
                    "id": gridCfgs[name].storeReaderId,
                    "fields": gridCfgs[name].storeReaderFields
                }),
                "baseParams": {
                    "start": 0,
                    "limit": gridCfgs[name].pageSize,
                    "predicate": gridCfgs[name].storePredicate
                }
            });
            gridCfgs[name].colModelColumns = new Array();
            for (var i = 0; i < gridCfgs[name].columns.length; i++) {
                var c = gridCfgs[name].columns[i];
                var pref = null;
                if (typeof c == "string") {
                    pref = c;
                } else if (typeof c == "object") {
                    if (c.usePredefined) {
                        pref = c.usePredefined;
                    }
                    if (c.editor) {
                        if (typeof c.editor == "string") {
                            try {
                                eval("c.editor = " + c.editor + ";");
                            } catch (e) {
                            }
                        }
                        try {
                            c.editor = c.editor.cloneConfig();
                        } catch (e) {
                        }
                    }

                    // #33555 - Site Admin: vulnerable to XSS
                    CQ.shared.XSS.updatePropertyName(c, "dataIndex");
                }

                if (pref && CQ.wcm.TLAdmin.COLUMNS[pref]) {
                    var prefCfg = CQ.Util.copyObject(CQ.wcm.TLAdmin.COLUMNS[pref]);
                    // overlay config options
                    for (var prop in c) {
                        if (prop == "usePredefined") continue;
                        prefCfg[prop] = c[prop];
                    }
                    gridCfgs[name].colModelColumns.push(prefCfg);
                } else {
                    gridCfgs[name].colModelColumns.push(c);
                }
            }
        }

        this.debug = config.debug;
        var id = config.id;

        var body = CQ.Ext.getBody();
        body.setStyle("margin", "0");
        if (CQ.Ext.isIE) {
            body.dom.scroll = "no";
        }
        else {
            body.setStyle("overflow", "hidden");
        }

        this.actions = [];
        this.checkedActions = [];
        var gridContextActions = [];

        // add global actions
        this.actions.push({
            "id": id + "-grid-refresh",
            "iconCls": "cq-siteadmin-refresh",
            "handler": this.reloadPages,
            "scope": this,
            "tooltip": {
                "title": id == "cq-damadmin" ? CQ.I18n.getMessage("Refresh Asset List") : CQ.I18n.getMessage("Refresh Page List"),
                "text": id == "cq-damadmin" ? CQ.I18n.getMessage("Refreshs the list of assets") : CQ.I18n.getMessage("Refreshs the list of pages"),
                "autoHide": true
            }
        });

        this.actions.push({
            "id": "language-filter",
            "width": "100",
            value: "Language",
            "fieldLabel": "Language Filter",
            "xtype": "selection",
            "type": "select",
            "defaultValue": "Language",
            "options": "/bin/languages.src.json",
            "stateful": true
        }, {
            "id": "statusFilter",
            "width": "100",
            "fieldLabel": "Status",
            "xtype": "selection",
            "type": "select",
            value: "Status",
            "defaultValue": "Status",
            "options": [
                {'value': 'not_translated', 'text': 'Not Translated'},
                {'value': 'translated', 'text': 'Translated'},
                {'value': 'in_translation', 'text': 'In Translation'},
                {'value': 'outdated', 'text': 'Outdated'}
            ],
            "stateful": true
        }, {
            "xtype": "button",
            "text": "Submit",
            "name": "submit",
            id: "gridFilterSubmit",
            "handler": function () {
                var status = CQ.Ext.getCmp("statusFilter").getValue();
                var language = CQ.Ext.getCmp("language-filter").getValue();
                if (status == "Status" || language == "Language") {
                    CQ.Notification.notify("Error!", "Please select status and language");
                }
                else {
                    if (status == "not_translated") {
                        CQ.wcm.TLAdmin.filter.getNotTranslated(language);
                    }
                    else if (status == "in_translation") {
                        CQ.wcm.TLAdmin.filter.getInTranslation(language);
                    }
                    else if (status == "outdated") {
                        CQ.wcm.TLAdmin.filter.getOutdated(language);
                    }
                    else {
                        CQ.wcm.TLAdmin.filter.getTranslated(language);
                    }
                }
            }
        }, {
            "xtype": "button",
            "text": "Reset",
            "name": "reset",
            id: "gridFilterReset",
            "handler": function () {
                CQ.Ext.getCmp("statusFilter").setValue("Status");
                CQ.Ext.getCmp("language-filter").setValue("Language");
                CQ.wcm.TLAdmin.filter.getAll();
            }
        });

        // add custom actions
        this.actions = this.actions.concat(
            this.formatActions(config.actions, gridContextActions));

        this.actions.push("->");

        var autoExpandMax = config.treeAutoExpandMax || CQ.TREE_AUTOEXPAND_MAX;

        // tree config
        var treeLdrCfg = CQ.Util.applyDefaults(config.treeLoader, {
            "requestMethod": "GET",
            //Set my URL here to load tree node : Vivek
            "dataUrl": "/bin/wcm/siteadmin/tree.json",
            "baseParams": {
                "ncc": autoExpandMax,
                "_charset_": "utf-8"
            },
            "baseAttrs": {
                "autoExpandMax": autoExpandMax,
                "singleClickExpand": true
                //"draggable":false,
                //"allowDrop":false,
//                "iconCls":"folder"
            },
            "listeners": {
                //Whatever needs to be passed to the servlet is specified here in baseparams. Here path is sent : Vivek
                "beforeload": function (loader, node) {
                    this.baseParams.path = node.getPath();
                }
            },
            createNode: function (attr) {
                //THis is called after data is retured from Servlet. Override this : Vivek
                if (this.baseAttrs) {
                    CQ.Ext.applyIf(attr, this.baseAttrs);
                }

                if (attr.type == "cq:Page") {
                    attr.iconCls = "page";
                }
                else if (/.*[fF]older/.test(attr.type)) {
                    // all types ending with "folder", e.g. "sling:Folder", "nt:folder"
                    attr.iconCls = "folder";
                }
                else if (attr.cls) {
                    attr.iconCls = attr.cls;
                }

                if (this.applyLoader !== false) {
                    attr.loader = this;
                }

                if (typeof attr.uiProvider == 'string') {
                    attr.uiProvider = this.uiProviders[attr.uiProvider] || eval(attr.uiProvider);
                }

                var node;
                if (attr.leaf) {
                    node = new CQ.Ext.tree.TreeNode(attr);
                } else {
                    node = new CQ.Ext.tree.AsyncTreeNode(attr);
                }
                node.on("dblclick", function (node, evt) {
                    evt.stopEvent();
                });
                return node;
            }
        });
        this.treeRootCfg = CQ.Util.applyDefaults(config.treeRoot, {
            "name": "content",
            "text": "Content",
            "draggable": false,
            //"allowDrop":false,
            "expanded": true,
            "iconCls": "file"
        });

        // look for anchor and clear existing tree state if present
        var anchor = CQ.HTTP.getAnchor(document.location.href);
        if (anchor) {
            var state = CQ.Ext.state.Manager.get(id + "-tree");
            if (state) {
                CQ.Ext.state.Manager.set(id + "-tree", state.width ?
                { width: state.width } : {});
            }
        }

        this.pagingToolbar = new CQ.Ext.PagingToolbar({
            pageSize: CQ.themes.wcm.SiteAdmin.GRID_PAGE_SIZE,
            store: null,
            displayInfo: true,
            displayMsg: "",
            emptyMsg: "",
            beforePageText: CQ.I18n.getMessage("Page"),
            afterPageText: CQ.I18n.getMessage("of {0}"),
            firstText: CQ.I18n.getMessage("First Page"),
            prevText: CQ.I18n.getMessage("Previous Page"),
            nextText: CQ.I18n.getMessage("Next Page"),
            lastText: CQ.I18n.getMessage("Last Page"),
            refreshText: CQ.I18n.getMessage("Refresh")
        });


        // the panel holding the tree and the grid
        var consolePanel = {
            "id": id + "-wrapper",
            "cls": "cq-siteadmin-wrapper",
            "xtype": "panel",
            "layout": "border",
            "border": false,
            "items": [
                {
                    "xtype": "treepanel",
                    "id": id + "-tree",
                    "cls": "cq-siteadmin-tree",
                    "region": "west",
                    "margins": "5 0 5 5",
                    "width": CQ.themes.wcm.SiteAdmin.TREE_WIDTH,
                    "autoScroll": true,
                    "containerScroll": true,
                    "collapsible": true,
                    "collapseMode": "mini",
                    "hideCollapseTool": true,
                    "animate": true,
                    "split": true,
                    "stateful": true,
                    "enableDD": false,
                    "ddScroll": false,
                    "ddGroup": CQ.wcm.TLAdmin.DD_GROUP_TREE,
                    "loader": new CQ.Ext.tree.TreeLoader(treeLdrCfg),
                    "root": new CQ.Ext.tree.AsyncTreeNode(this.treeRootCfg),
                    "tbar": [
                        {
                            "id": id + "-tree-refresh",
                            "iconCls": "cq-siteadmin-refresh",
                            "handler": function () {
                                admin.mask();
                                CQ.Ext.getCmp(id + "-tree").getRootNode().reload();
                                admin.loadPath();
                            },
                            "tooltip": {
                                "title": CQ.I18n.getMessage("Refresh Page Tree"),
                                "text": CQ.I18n.getMessage("Refreshs the page tree"),
                                "autoHide": true
                            }
                        }
                    ],
                    "listeners": {
                    }
                },
                {
                    "xtype": "siteadmingrid",
                    "id": id + "-grid",
                    "region": "center",
                    "enableDragDrop": false,
                    "ddGroup": CQ.wcm.TLAdmin.DD_GROUP_GRID,
                    "ddText": CQ.I18n.getMessage("Reordering..."),
                    "tbar": this.actions,
                    "bbar": this.pagingToolbar,
                    "contextActions": gridContextActions,
                    "admin": this,
                    "listeners": {
                        "render": function (grid) {
                            admin.hidePagingToolbar();
                            grid.getSelectionModel().on("selectionchange",
                                function (sm) {
                                    // enable/disable toolbar items
                                    var sel = sm.getSelections();
                                    for (var i = 0; i < sel.length; i++) {
                                        admin.typeCache[sel[i].id] = sel[i].get("type");
                                    }

                                    //slightly defer because it will send a request that might take some time
                                    //and this time seems to break the event handling (click) which comes after
                                    admin.checkActions.defer(200, admin);
                                }
                            );

                            // bottom margin to allow reordering at the end of the list
                            grid.getView().mainBody.setStyle("padding-bottom", "22px");
                        },
                        "click": function (grid) {
//                            alert("I am clicked")
                        },
                        "dblclick": function () {
                            evt.stopEvent();
                        }
                    }
                }

            ]
        };

        var centerPanel;

        if (config.tabTitle || config.tabs) {
            consolePanel.title = config.tabTitle ? CQ.I18n.getVarMessage(config.tabTitle) : CQ.I18n.getMessage("Console");

            var items = [consolePanel];

            if (config.tabs) {
                for (var i = 0; i < config.tabs.length; i++) {
                    items.push(CQ.Util.applyDefaults(config.tabs[i], {"admin": this}));
                }
            }

            centerPanel = {
                "activeTab": 0,
                "region": "center",
                "id": id + "-tabpanel",
                "xtype": "tabpanel",
                "cls": "cq-siteadmin-tabpanel",
                "border": false,
                "enableTabScroll": true,
                "items": items,
                "listeners": {
                }
            };
        }
        else {
            consolePanel.region = "center";
            centerPanel = consolePanel;
        }

        // init component by calling super constructor
        CQ.wcm.SiteAdmin.superclass.constructor.call(this, {
            "id": id,
            "layout": "border",
            "renderTo": CQ.Util.ROOT_ID,
            "gridConfig": gridCfgs,
            "items": [
                {
                    "id": "cq-header",
                    "xtype": "container",
                    "cls": id + "-header",
                    "autoEl": "div",
                    "region": "north",
                    "items": [
                        {
                            "xtype": "panel",
                            "border": false,
                            "layout": "column",
                            "cls": "cq-header-toolbar",
                            "items": [
//                                new CQ.Switcher({}), CQ Switcher removed : Vivek
                                new CQ.UserInfo({}),
                                new CQ.HomeLink({})
                            ]
                        }
                    ]
                },
                centerPanel
            ]
        });

        // init history, check for anchor and open tree
        new CQ.Ext.form.Hidden({
            "id": CQ.Ext.History.fieldId,
            "renderTo": CQ.Util.ROOT_ID
        });
        var historyFrame = document.createElement("iframe");
        historyFrame.id = CQ.Ext.History.iframeId;
        historyFrame.src = CQ.Ext.SSL_SECURE_URL;
        historyFrame.className = "x-hidden";
        historyFrame.frameBorder = "0";
        historyFrame.border = "0";
        new CQ.Ext.Element(historyFrame).appendTo(CQ.Util.getRoot());

        CQ.Ext.History.init();
        CQ.Ext.History.on("change", function (token) {
            var current = admin.getCurrentPath();
            if (admin.id == "cq-damadmin") {
                // check if token is a tree node (direcotry) or an asset
                var tree = CQ.Ext.getCmp(window.CQ_TLAdmin_id + "-tree");
                var isTreeNode = false;
                tree.selectPath(token, "name",
                    function (success) {
                        if (success) isTreeNode = true;
                    }
                );

                var tabPanel = CQ.Ext.getCmp(window.CQ_TLAdmin_id + "-tabpanel");

                if (isTreeNode) {
                    // token is directory: => open admin tab
                    tabPanel.setActiveTab(admin.id + "-wrapper");
                }
                else {
                    // token is asset => open asset
                    var id = CQ.DOM.encodeId(token);
                    var editor = CQ.Ext.getCmp(id);
                    if (editor) {
                        // asset is already open: switch to tab
                        tabPanel.setActiveTab(editor);

                    }
                    else {
                        // asset is not open: load path in tree and open asset
                        admin.loadPath(token);
                        tabPanel.setActiveTab(admin.id + "-wrapper");
                    }
                }
            }
            else {
                if (token != current) {
                    admin.loadPath(token);
                }
            }
        });

        if (anchor) {
            admin.loadPath(decodeURI(anchor));
        }
        window.CQ_TLAdmin_id = id;

        // stop editing when window loses focus
        CQ.Ext.EventManager.on(window, "blur", function () {
            window.setTimeout(function () {
                CQ.Ext.getCmp(id + "-grid").stopEditing(true);
            }, 500);
        });

        this.typeCache = {};
    },

    initComponent: function () {
        CQ.wcm.SiteAdmin.superclass.initComponent.call(this);

        var admin = this;
        CQ.Ext.getCmp(admin.id + "-tree").getSelectionModel().on(
            "selectionchange",
            function (selModel, node) {
                if (node) {
                    var path = node.getPath();
                    admin.loadPages(node);
                    CQ.Ext.History.add(path, true);
                    admin.setDocumentTitle(node.text);
                    if (node.attributes && node.attributes.type) {
                        admin.typeCache[path] = node.attributes.type;
                    }
                    admin.checkActions();
                }
            }
        );


        CQ.HTTP.get(CQ.shared.HTTP.encodePath("/bin/fetchBasketItems"),
            function (options, success, response) {
                if (success) {
                    CQ.Ext.getCmp("cq-tladmin-basket-button").setText("(" + JSON.parse(response.responseText).totalItems + ")")
                }
            });
    },

    setDocumentTitle: function (text) {
        var t = this.title;
        if (text) t += " | " + text;
        document.title = t;
    },

    /**
     * Returns the node or resource type of the node at the specified path.
     * @param {String} path The path
     * @return {String} The type
     */
    getType: function (path) {
        if (!this.typeCache[path]) {
            var info = CQ.HTTP.eval(path + ".json");
            if (info) {
                this.typeCache[path] = info["jcr:primaryType"];
            }
        }
        return this.typeCache[path];
    },

    getGridConfigId: function (path) {
        if (!path) path = "/";
        var gridCfgs = this.initialConfig.gridConfig;
        var id;
        for (id in gridCfgs) {
            gridCfg = gridCfgs[id];
            if (new RegExp(gridCfgs[id].pathRegex).test(path)) {
                break;
            }
        }
        if (!id) id = "pages";
        return id;
    },

    getGridConfig: function (path) {
        var gridCfgs = this.initialConfig.gridConfig;
        var id = this.getGridConfigId(path);
        if (id) {
            return gridCfgs[id];
        } else {
            return null;
        }
    },

    reconfigureGrid: function (grid, path) {
        grid.inProgress = [];
        var gridCfg = this.getGridConfig(path);
        if (!gridCfg) {
            // should actually never happen, but just in case
            return grid.getStore();
        }
        if (!gridCfg.inited) {
            gridCfg.store = new CQ.Ext.data.Store(gridCfg.storeConfig);
            gridCfg.store.on("beforeload", function () {
//                console.log(grid.inProgress.length, "reset queue");
                grid.inProgress = [];
            });
            gridCfg.colModel = new CQ.Ext.grid.ColumnModel({
                "columns": gridCfg.colModelColumns,
                "defaults": {
                    "sortable": true
                }
            });
            gridCfg.colModel.on("hiddenchange", function (cm, index, hidden) {
                // make sure grid state is saved when columns are hidden or shown
                grid.saveState();
                if (!hidden && cm.getColumnById(cm.getColumnId(index)).refreshOnHiddenchange) {
                    // refresh thumbnail column when shown
                    grid.getView().refresh(true);
                }

            });
            gridCfg.inited = true;
        }
        // update store url
//        var url = gridCfg.storeProxyPrefix + CQ.shared.HTTP.encodePath(path) +
//            gridCfg.storeProxySuffix;

        var indexOfDot = gridCfg.storeProxySuffix.lastIndexOf(".")
        var requestType = gridCfg.storeProxySuffix.substring(1, indexOfDot);
        var updatedUrl = "/bin/fetchGridPages?path=" + path + "&type=" + requestType
        //Update URL here to my servlet to show content in the grid: Vivek
        gridCfg.store.proxy.api["read"].url = updatedUrl;
        // forget last options
        if (gridCfg.store.lastOptions) {
            delete gridCfg.store.lastOptions;
        }

        // setup paging toolbar
        this.pagingToolbar.bindStore(gridCfg.store);
        this.pagingToolbar.pageSize = gridCfg.pageSize;
        this.pagingToolbar.displayMsg = gridCfg.pageText;

        // check if grid needs to be reconfigured
        if (gridCfg.pathRegex != this.lastGridPathRegex) {
            grid.reconfigure(gridCfg.store, gridCfg.colModel);
            var id = this.getGridConfigId(this.treePath);
            grid.stateId = grid.id + "-" + id;
            grid.initState();
            this.lastGridPathRegex = gridCfg.pathRegex;
            gridCfg.store.removeAll();
        }
        return gridCfg.store;
    },

    showPagingToolbar: function () {
        if (this.pagingToolbar.hidden) {
            this.pagingToolbar.show();
            this.pagingToolbar.ownerCt.doLayout();
        }
    },

    hidePagingToolbar: function () {
        if (!this.pagingToolbar.hidden) {
            this.pagingToolbar.hide();
            this.pagingToolbar.ownerCt.doLayout();
        }
    },

    checkPagingToolbar: function (total) {
        if (total <= this.pagingToolbar.pageSize) {
            this.hidePagingToolbar();
        } else {
            this.showPagingToolbar();
        }
    },

    reloadPages: function () {
        this.mask();
        var store = CQ.Ext.getCmp(this.id + "-grid").getStore();
        store.reload({
            "callback": function () {
                this.checkPagingToolbar(store.getTotalCount());
                this.unmask();
            },
            "scope": this
        });
    },

    loadPages: function (node, selectRecord) {
        this.mask();
        var path = node.getPath();
        this.treePath = path;
        var grid = CQ.Ext.getCmp(this.id + "-grid");
        var store = this.reconfigureGrid(grid, this.treePath);
        var id = this.id;
        var admin = this;
        store.reload({
            callback: function (records, options, success) {
                if (id == "cq-damadmin") {
                    var cookieValue = "path=" + encodeURIComponent(path) + "&p.limit=-1&mainasset=true&type=dam:Asset";
                    CQ.HTTP.setCookie("cq-mrss", cookieValue, "/bin");
                }

                var recSelected = false;
                if (selectRecord) {
                    var selModel = grid.getSelectionModel();
                    for (var i = 0; i < records.length; i++) {
                        if (records[i].id == selectRecord) {
                            selModel.clearSelections();
                            selModel.selectRecords([records[i]]);
                            recSelected = true;
                        }
                    }
                    if (id == "cq-damadmin" && selModel.hasSelection()) {
                        CQ.wcm.SiteAdmin.openPages.call(admin);
                    }
                }
                admin.checkPagingToolbar(store.getTotalCount());
                if (selectRecord && !recSelected && !admin.pagingToolbar.hidden) {
                    try {
                        var sort = grid.getStore().sortInfo;
                        var url = store.proxy.api.read.url;
                        for (var param in store.baseParams) {
                            url = CQ.HTTP.addParameter(url, param, store.baseParams[param]);
                        }
                        if (sort) {
                            url = CQ.HTTP.addParameter(url, "sort", sort.field);
                            url = CQ.HTTP.addParameter(url, "dir", sort.direction);
                        }
                        url = CQ.HTTP.addParameter(url, "index", "true");
                        url = CQ.HTTP.addParameter(url, "path", selectRecord);

                        var index = CQ.HTTP.eval(url).index + 1;
                        if (index > 0) {
                            var selectRow = function (recs) {
                                grid.getSelectionModel().selectRecords([this.getById(selectRecord)]);
//                                CQ.wcm.SiteAdmin.openPages.call(admin);
                                this.un("load", selectRecord);
                            };
                            grid.getStore().on("load", selectRow);
                            admin.pagingToolbar.changePage(index);
                        }
                    } catch (e) {
                        //console.log("error:" + e);
                    }
                }
                admin.unmask();
            }
        });
    },

    loadPath: function (path, selectRecord) {
        var admin = this;
        var callback = function (success, node, selectRecord) {
            if (success) {
                this.loadPages(node, selectRecord);
                node.expand();
            }
            else {
                // path not found => load parent
                this.loadPath(this.treePath.substring(0, this.treePath.lastIndexOf("/")), this.treePath);
            }
        };

        // select tree path
        var tree = CQ.Ext.getCmp(this.id + "-tree");

        if (!path && !this.treePath) {
            this.treePath = tree.getRootNode().getPath();
            tree.selectPath(tree.getRootNode().id, "id",
                function (success, node) {
                    callback.call(admin, success, node, selectRecord);
                }
            );
        } else {
            if (path) {
                this.treePath = path;
            }
            if (this.treePath == tree.getRootNode().getPath()) {
                tree.selectPath(tree.getRootNode().id, "id",
                    function (success, node) {
                        callback.call(admin, success, node, selectRecord);
                    }
                );
            } else {
                tree.selectPath(this.treePath, "name",
                    function (success, node) {
                        callback.call(admin, success, node, selectRecord);
                    }
                );
            }
        }
    },

    reloadCurrentTreeNode: function () {
        // TODO insert new tree node directly instead of reloading parent
        var tree = CQ.Ext.getCmp(this.id + "-tree");
        var selectedNode;
        try {
            selectedNode = tree.getSelectionModel().getSelectedNode();
        } catch (e) {
        }
        if (selectedNode && selectedNode != tree.getRootNode()) {
            var selectedPath = selectedNode.getPath();
            selectedNode.parentNode.reload(function () {
                tree.selectPath(selectedPath, null, function (success, node) {
                    if (success) {
                        node.expand();
                    }
                });
            });
        } else {
            tree.getRootNode().reload();
        }
        CQ.Ext.getCmp(this.id + "-grid").getStore().reload();
        this.unmask();
    },

    /**
     * Returns the currently selected path in the tree.
     * @return {String} The current path
     */
    getCurrentPath: function () {
        var tree = CQ.Ext.getCmp(this.id + "-tree");
        var node = tree.getSelectionModel().getSelectedNode();
        if (node != null) {
            return node.getPath();
        }
    },

    /**
     * Returns the currently selected pages in the grid.
     * @return {Object[]} The selected pages
     */
    getSelectedPages: function () {

        var gridSel = CQ.Ext.getCmp(this.id + "-grid").getSelectionModel().getSelections();

        //use grid from active tab
        var tabPanel = CQ.Ext.getCmp(window.CQ_TLAdmin_id + "-tabpanel");
        if (tabPanel) {
            var grid = CQ.Ext.getCmp(tabPanel.getActiveTab().id + "-grid");
            if (grid) {
                gridSel = grid.getSelectionModel().getSelections();
            }
        }

        if (gridSel.length > 0) {
            return gridSel;
        } else if (this.treePath) {
            var admin = this;
            var node = CQ.Ext.getCmp(this.id + "-tree").getSelectionModel().getSelectedNode();
            return [
                {
                    "id": admin.treePath,
                    "label": admin.treePath.substring(admin.treePath.lastIndexOf("/") + 1),
                    "replication": node && node.attributes ? node.attributes.replication : null,
                    "title": node ? node.text : null,
                    "type": null,
                    "_displayTitle_": true,
                    "get": function (name) {
                        // fake getter
                        return this[name];
                    }
                }
            ];
        } else {
            return [];
        }
    },

    /**
     * Masks the main panel for loading.
     */
    mask: function () {
        if (!this.loadMask) {
            this.loadMask = new CQ.Ext.LoadMask(this.id + "-wrapper", {
                "msg": CQ.I18n.getMessage("Loading...")
            });
        }
        this.loadMask.show();
    },

    /**
     * Unmasks the main panel after loading.
     */
    unmask: function (timeout) {
        if (!this.loadMask) return;
        this.loadMask.hide();
    }
});

CQ.Ext.reg("tladmin", CQ.wcm.TLAdmin);

//overrides current CQ.wcm.TLAdmin class with methods contained in CQ.wcm.AdminBase.
CQ.Ext.override(CQ.wcm.TLAdmin, CQ.wcm.AdminBase);


// constants
CQ.wcm.TLAdmin.DD_GROUP_TREE = "cq.tladmin.tree";
CQ.wcm.TLAdmin.DD_GROUP_GRID = "cq.tladmin.grid";

CQ.wcm.TLAdmin.COLUMNS = {
    "numberer": {
        "id": "numberer",
        "header": CQ.I18n.getMessage(""),
        "width": 23,
        "menuDisabled": true,
        "fixed": true,
        "hideable": false,
        "dataIndex": "index",
        "renderer": function (v, params, record) {
            if (v != undefined) {
                return v + 1;
            }
            return "";
        }
    },
    "title": {
        "header": CQ.I18n.getMessage("Title"),
        "id": "title",
        "width": 50,
        "dataIndex": "title",
        "renderer": function (val, meta, rec) {
            return CQ.shared.XSS.getXSSValue(val);
        }
    },
    "path": {
        "header": CQ.I18n.getMessage("Path"),
        "id": "name",
        "dataIndex": "path",
        "width": 100
    },
    "pageLanguage": {
        "header": CQ.I18n.getMessage("Language"),
        "id": "pageLanguage",
        "dataIndex": "languageNiceName",
        "width": 40
    },
    "status": {
        "header": CQ.I18n.getMessage("Status"),
        "id": "status",
        "width": 60,
        // use an undefined dataIndex in order to avoid unexpected behaviour
        "dataIndex": "status",
        "renderer": function (v, params, record) {
            var status = CQ.wcm.TLAdmin.PageStatus(record);
            var statusMap = {"in_translation": "In Translation", "not_translated": "Not Translated", "translated": "Translated", "outdated": "Outdated"};
            var label = record.json.status ? record.json.status : "not_translated";
            return "<div class='" + status + "'>" + statusMap[label] + "</div>";
        }
    },
    "translatedTo": {
        "header": CQ.I18n.getMessage("Translated To"),
        "id": "translatedTo",
        "dataIndex": "translatedTo",
        "width": 70,
        "renderer": function (v, params, record) {
            return CQ.shared.XSS.getXSSValue(v);
        }
    },
    "translatedFrom": {
        "header": CQ.I18n.getMessage("Translated From"),
        "id": "translatedFrom",
        "dataIndex": "translatedFrom",
        "width": 70,
        "renderer": function (v, params, record) {
            return CQ.shared.XSS.getXSSValue(v);
        }
    },
    "hasChildren": {
        "header": "Include Children",
        "id": "includeChildren",
        "width": 60,
        "renderer": function (v, params, record) {

            CQ.wcm.TLAdmin.changeState = function (currentValue) {
                var grid = CQ.Ext.getCmp("cq-tladmin-grid")
                var currentRecord = grid.getSelectionModel().getSelections()[0]
                currentRecord.data.includeChildren = currentValue;
            }
            //Add a condition to display it only when it has children
            if (record.data.hasChildren) {
                var r = "";
                r += "<select name='child-options' class='beebox-child-option' onchange='CQ.wcm.TLAdmin.changeState(this.value)'><option value=''>None</option><option value='immediate'>Immediate subpages</option><option value='all'>All subpages</option></select>";

                return r;
            }

        }
    },
    "basketActions": {
        "id": "basketActions",
        "width": 40,
        "renderer": function (v, params, record) {
            CQ.wcm.TLAdmin.addToBasket = function (element) {
                var grid = CQ.Ext.getCmp("cq-tladmin-grid");
                var currentRecord = grid.getSelectionModel().getSelections()[0];
                console.log(currentRecord)
                var basketItem = {"pageId": currentRecord.id, "includeChildren": currentRecord.data.includeChildren, "title": encodeURIComponent(currentRecord.data.title), "label": currentRecord.data.label, "requestType": "add", "sourceLanguage": currentRecord.data.pageLanguage};
                if (!CQ.wcm.TLAdmin.checkIfValidPageHierarchy(currentRecord.id) && currentRecord.data.type == "cq:Page") {
                    CQ.Notification.notify("Error!!", "Invalid Page Hierarchy",.5);
                }
                else {
                    $.getJSON(CQ.shared.HTTP.encodePath("/bin/fetchBasketItems"), basketItem)
                        .done(function (response) {
                            CQ.Ext.getCmp("cq-tladmin-basket-button").setText("(" + response.totalItems + ")");
                            CQ.Notification.notify("Success!!", "Added to Basket",.3);
                            $(element).find("img").attr("src", "/etc/clientlibs/beebox/widgets/images/removeBasket.png");
                            $(element).attr("onclick", "CQ.wcm.TLAdmin.removeFromBasket(this)");
                        })
                        .fail(function (jqxhr, textStatus, error) {
                            var err = textStatus + ", " + error;
                            console.log("Request Failed: " + err);
                        });
                }

            };

            CQ.wcm.TLAdmin.removeFromBasket = function (element) {
                var grid = CQ.Ext.getCmp("cq-tladmin-grid");
                var recordToDelete = grid.getSelectionModel().getSelections()[0];

                var basketItem = {"pageId": recordToDelete.id, "requestType": "delete"};

                $.getJSON(CQ.shared.HTTP.encodePath("/bin/fetchBasketItems"), basketItem)
                    .done(function (response) {
                        CQ.Ext.getCmp("cq-tladmin-basket-button").setText("(" + response.totalItems + ")");
                        CQ.Notification.notify("Success!!", "Removed from Basket");
                        $(element).find("img").attr("src", "/etc/clientlibs/beebox/widgets/images/add_basket.png");
                        $(element).attr("onclick", "CQ.wcm.TLAdmin.addToBasket(this)");
                    })
                    .fail(function (jqxhr, textStatus, error) {
                        var err = textStatus + ", " + error;
                        console.log("Request Failed: " + err);
                    });
            };


            var r = ""
            if (record.json.inBasket) {
                r += "<a href='javascript:void(0)' onclick='CQ.wcm.TLAdmin.removeFromBasket(this)'><img src='/etc/clientlibs/beebox/widgets/images/removeBasket.png'/></a>"
            }
            else {
                r += "<a href='javascript:void(0)' onclick='CQ.wcm.TLAdmin.addToBasket(this)'><img src='/etc/clientlibs/beebox/widgets/images/add_basket.png'/></a>"
            }
            return r
        }
    }
};


CQ.wcm.TLAdmin.sourceLanguages = [];
CQ.wcm.TLAdmin.targetLanguages = [];

$.getJSON(CQ.shared.HTTP.encodePath("/bin/languages.src.json"))
    .done(function (response) {
        $.each(response, function (idx, val) {
            CQ.wcm.TLAdmin.sourceLanguages.push(val.value)
        });
    });

$.getJSON(CQ.shared.HTTP.encodePath("/bin/languages.target.json"))
    .done(function (response) {
        $.each(response, function (idx, val) {
            CQ.wcm.TLAdmin.sourceLanguages.push(val.value)
        });
    });

CQ.wcm.TLAdmin.checkIfValidPageHierarchy = function (pagePath) {
    var validFlag = false
    $.each(CQ.wcm.TLAdmin.sourceLanguages, function (idx, languageValue) {
        var languageUri = "/" + languageValue;
        var lastIndex = pagePath.lastIndexOf(languageUri);
        var isRootPage = (lastIndex != -1) && (lastIndex + languageUri.length == pagePath.length);
        if (pagePath.indexOf(languageUri + "/") > -1 || isRootPage) {
            validFlag = true
        }
    });
    if (!validFlag) {
        $.each(CQ.wcm.TLAdmin.targetLanguages, function (idx, languageValue) {
            var languageUri = "/" + languageValue;
            var lastIndex = pagePath.lastIndexOf(languageUri);
            var isRootPage = (lastIndex != -1) && (lastIndex + languageUri.length == pagePath.length);
            if (pagePath.indexOf(languageUri + "/") > -1 || isRootPage) {
                validFlag = true
            }
        });
    }
    return validFlag;
}
