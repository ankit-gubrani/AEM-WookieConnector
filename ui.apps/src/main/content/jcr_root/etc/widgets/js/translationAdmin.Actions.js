CQ.wcm.TLAdmin.beeboxBasketHandler = function () {
    CQ.wcm.TLAdmin.BasketGridStore = new CQ.Ext.data.Store({
        // explicitly create reader
        "proxy": new CQ.Ext.data.HttpProxy({
            "method": "GET",
            "url": "/bin/fetchBasketItems"
        }),
        "reader": new CQ.Ext.data.JsonReader({
            "fields": ["title", "pageId", "pageLanguage", "languageNiceName", "includeChildren"],
            "root": "itemList",
            "totalProperty": "totalItems"
        })
    });
    var grid = new CQ.Ext.grid.GridPanel({
        id: "basketGridPanel",
        store: CQ.wcm.TLAdmin.BasketGridStore,
        colModel: new CQ.Ext.grid.ColumnModel({
            defaults: {
                width: 120,
                sortable: true
            },
            columns: [
                {id: 'title', header: 'Title', sortable: true, dataIndex: 'title'},
                {id: 'path', header: 'Path', width: 200, sortable: true, dataIndex: 'pageId'},
                {id: 'sourceLang', header: 'Language', width: 150, sortable: true, dataIndex: 'languageNiceName'},
                {id: 'includeChildren', header: 'Include Children', width: 150, sortable: true, dataIndex: 'includeChildren', "renderer": function (v, params, record) {
                    if (v == "immediate") {
                        return "Immediate subpages";
                    }
                    else if (v == "all") {
                        return "All subpages";
                    }
                    else {
                        return "None";
                    }
                }},
                {id: "removeBasket", dataIndex: "dummy", "renderer": function (v, params, record) {

                    CQ.wcm.TLAdmin.removeMe = function () {
                        var grid = CQ.Ext.getCmp("basketGridPanel");
                        var recordToDelete = grid.getSelectionModel().getSelections()[0];

                        var basketItem = {"pageId": recordToDelete.data.pageId, "requestType": "delete"};

                        $.getJSON(CQ.shared.HTTP.encodePath("/bin/fetchBasketItems"), basketItem)
                            .done(function (response) {
                                CQ.Ext.getCmp("cq-tladmin-basket-button").setText("(" + response.totalItems + ")");
                                CQ.Notification.notify("Success!!", "Removed from Basket");
                                grid.getStore().reload();
                                grid.getView().refresh();
                                CQ.Ext.getCmp("cq-tladmin-grid").getStore().reload();
                                CQ.Ext.getCmp("cq-tladmin-grid").getView().refresh();
                            })
                            .fail(function (jqxhr, textStatus, error) {
                                var err = textStatus + ", " + error;
                                console.log("Request Failed: " + err);
                            });
                    };
                    var r = ""
                    r += "<a href='javascript:void(0)' onclick='CQ.wcm.TLAdmin.removeMe()'><img src='/etc/clientlibs/beebox/widgets/images/removeBasket.png'/></a>"

                    return r
                }}
            ]

        }),
        bbar: new CQ.Ext.PagingToolbar({
            pageSize: 10,
            store: CQ.wcm.TLAdmin.BasketGridStore,
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
        }),
        viewConfig: {
            forceFit: true
        },
        width: 600,
        height: 300,
        iconCls: 'icon-grid'
    });

    var basketDialog = {
        "jcr:primaryType": "cq:Dialog",
        itemId: "basketWindow",
        id: "basketWindow",
        title: "Basket",
        layout: 'fit',
        waitMsgTarget: true,
        width: 800,
        height: 450,
        x: "250",
        y: "100",
        closable: false,
        items: grid,
        bbar: {
            "jcr:primaryType": "cq:Widget",
            "id": "langSet",
            "title": "Translate content into:",
            "xtype": "dialogfieldset",
            "collapsed": false,
            "collapsible": false,
            "items": {
                "jcr:primaryType": "cq:Widget",
                id: 'targetLanguageGroup',
                xtype: 'checkboxgroup',
                itemCls: 'target-language-checkbox-group',
                items: CQ.wcm.TLAdmin.targetLangCheckboxconfig
            }
        },
        tbar: {
            "jcr:primaryType": "cq:Panel",
            layout: "form",
            id: "basket-bbar",
            "items": {
                "jcr:primaryType": "cq:WidgetCollection",
                "jobNiceName": {
                    "jcr:primaryType": "cq:Widget",
                    "xtype": 'textfield',
                    "fieldLabel": CQ.I18n.getMessage("Job Label:"),
                    "name": "jobName",
                    "id": "jobNiceName",
                    "allowBlank": true
                },
                "endDate": {
                    "jcr:primaryType": "cq:Widget",
                    "xtype": 'datetime',
                    dateFormat: "d F Y",
                    "fieldLabel": CQ.I18n.getMessage("Expected end date:"),
                    "name": "jobEndDate",
                    "id": "jobEndDate",
                    "allowBlank": true
                }
            }
        },
        "buttons": {
            "jcr:primaryType": "cq:WidgetCollection",
            "requestedOption1": {
                xtype: 'radio',
                name: 'requestedOption',
                inputValue: 'rfq',
                cls: "beebox-radio-basket",
                id: "option-rfq",
                boxLabel: 'Request quotation'
            },
            "requestedOption2": {
                xtype: 'radio',
                name: 'requestedOption',
                id: "option-sfq",
                inputValue: 'sft',
                cls: "beebox-radio-basket",
                boxLabel: 'Send for translation'
            },
            "submit": {
                text: '<b>Submit</b>',
                handler: function () {
                    var rfqOption = CQ.Ext.getCmp("option-rfq");
                    var sfqOption = CQ.Ext.getCmp("option-sfq");
                    var jobNiceName = CQ.Ext.getCmp("jobNiceName").getValue();
                    var jobEndDate = "";
                    var continueSending = true
                    if (CQ.Ext.getCmp("jobEndDate").getValue() !== "") {
                        jobEndDate = CQ.Ext.getCmp("jobEndDate").dateValue;
                        var jobEndDateString = jobEndDate.getFullYear() + "-" + (jobEndDate.getMonth() + 1) + "-" + jobEndDate.getDate() + "T" + jobEndDate.getHours() + ":" + jobEndDate.getMinutes() + ":" + jobEndDate.getSeconds() + "." + jobEndDate.getMilliseconds() + "Z";
                        if (jobEndDate - new Date() < 0) {
                            continueSending = false
                        }
                    }
                    if (continueSending == false) {
                        CQ.Notification.notify("Error!", "Deadline should be a future date");
                    }
                    else if (!rfqOption.checked && !sfqOption.checked) {
                        CQ.Notification.notify("Error!", "Please select at least one option");
                    }
                    else if (rfqOption.checked) {
                        CQ.wcm.TLAdmin.sendJobsForQuotationAndTranslation("quotation", jobEndDateString, jobNiceName, function () {
                        });
                    }
                    else {
                        CQ.wcm.TLAdmin.sendJobsForQuotationAndTranslation("translation", jobEndDateString, jobNiceName, function () {
                        });
                    }
                }
            },
            "Clear": {
                text: '<b>Empty basket</b>',
                handler: function () {
                    var requestTypeOption = {"requestType": "empty"};
                    $.getJSON(CQ.shared.HTTP.encodePath("/bin/fetchBasketItems"), requestTypeOption)
                        .done(function (response) {
                            CQ.Ext.getCmp("cq-tladmin-basket-button").setText("(0)");
                            CQ.Ext.getCmp("cq-tladmin-grid").getStore().reload();
                            basketDialogObj.close();
                            CQ.Notification.notify("Success!!", "Basket has been cleared");
                        })
                        .fail(function (jqxhr, textStatus, error) {
                            CQ.Notification.notify("Oops!!", "Basket could not be cleared because of some error");
                            var err = textStatus + ", " + error;
                            console.log("Request Failed: " + err);
                        });
                }
            },
            "Cancel": {
                text: '<b>Cancel</b>',
                handler: function () {
                    basketDialogObj.close();
                }
            }

        },
        modal: true
    };

    CQ.Ext.getCmp("basketGridPanel").getStore().reload();
    var basketDialogObj = CQ.WCM.getDialog(basketDialog);
    basketDialogObj.show();
};

CQ.wcm.TLAdmin.targetLangCheckboxconfig = [];

$.getJSON(CQ.shared.HTTP.encodePath("/bin/languages.target"))
    .done(function (response) {
        $.each(response, function (idx, val) {
            CQ.wcm.TLAdmin.targetLangCheckboxconfig.push({boxLabel: val.text, name: val.value})
        });
    })
    .fail(function (jqxhr, textStatus, error) {
        var err = textStatus + ", " + error;
        console.log("Request Failed: " + err);
    });

CQ.wcm.TLAdmin.sendJobsForQuotationAndTranslation = function (requestType, jobEndDate, jobNiceName, callback) {
    var mask = new CQ.Ext.LoadMask(CQ.Ext.getBody(), {
        msg: "Pages are pushed to server for " + requestType + ".Please wait...:)"
    });
    var targetLanguage = [];
    var selectedCheckboxList = CQ.Ext.getCmp("targetLanguageGroup").getValue();
    $.each(selectedCheckboxList, function (idx, value) {
        targetLanguage.push(value.name)
    });
    if (selectedCheckboxList.length == 0) {
        CQ.Notification.notify("Error!", "Please select atleast one target language");
        return false;
    }
    else {
        mask.show();
        $.getJSON(CQ.shared.HTTP.encodePath("/bin/sendJobForTranslation"), {
            "tl": JSON.stringify(targetLanguage),
            "requestType": requestType,
            "jobNiceName": jobNiceName,
            "jobEndDate": jobEndDate
        })
            .done(function (response) {
                if (response.errorMessage != "") {
                    CQ.Notification.notify("Error!", response.errorMessage);
                }
                else {
                    CQ.Notification.notify(null, "Congratulations !! Pages have been sent for " + requestType, .3);
                    CQ.Ext.getCmp("cq-tladmin-basket-button").setText("(0)");
                    CQ.Ext.getCmp("cq-tladmin-grid").getStore().reload();
                    CQ.Ext.getCmp("cq-tladmin-grid").getView().refresh();
                    CQ.wcm.TLAdmin.quotationStore.reload();
                    callback();
                }
            })
            .fail(function (jqxhr, textStatus, error) {
                alert("failed");
                callback();
            });
        window.setTimeout(function () {
            mask.hide();
        }, 1000);
        CQ.Notification.notify("Message!", "Your request is in progress, please wait.... Don't refresh window!!!");
        CQ.Ext.getCmp("basketWindow").close();
    }

};
