{
    "tabTip": CQ.I18n.getMessage("Wookie Widgets"),
    "id": "cfTab-Wookie-widgets",
    "xtype": "contentfindertab",
    "iconCls": "cq-cft-tab-icon wookie",
    "ranking": 1,
    "items": [
    CQ.wcm.ContentFinderTab.getResultsBoxConfig({
        "itemsDDGroups": [CQ.wcm.EditBase.DD_GROUP_ASSET],
        "itemsDDNewParagraph": {
            "path": "foundation/components/download",
            "propertyName": "./wookieWidget"
        },
        "items": {
            "tpl":
                '<tpl for=".">' +
                    '<div class="cq-cft-search-item cq-cft-wookie-item" title="{pathEncoded}" ondblclick="CQ.wcm.ContentFinder.loadContentWindow(\'{[CQ.HTTP.encodePath(values.path)]}.html\');">' +
                    '<div class="cq-cft-wookie-thumb-top <tpl if=\"!values.icon.src\">wookie-default-widget</tpl>" style="background-image:url(\'{[values.icon.src]}\');"></div>' +
                    '<div class="cq-cft-wookie-text-wrapper">' +
                    '<div class="cq-cft-wookie-title">{[values.name.content]}</div>' +
                    '<div class="cq-cft-wookie-decription">{[values.description]}</div>' +
                    '</div>' +
                    '<div class="cq-cft-wookie-separator"></div>' +
                    '</div>' +
                    '</tpl>',
            "itemSelector": CQ.wcm.ContentFinderTab.DETAILS_ITEMSELECTOR
        },
        "tbar": [
            CQ.wcm.ContentFinderTab.REFRESH_BUTTON
        ]
    },{
        "url": "/bin/aem-wookie.widgets.html"
    }, {
        "baseParams": {
            /*"defaultMimeType": "image"*/
            "mimeType": "image"
        },
        "autoLoad":false,
        "reader": new CQ.Ext.data.JsonReader({
            "totalProperty": "results",
            "root": "widgets.widget",
            "fields": [
                {name: "path", mapping: "id"}, "author", "height", "description", "name", "width", "license", "version","icon"
            ],
            "id": "path"
        })
    })
]

}