CQ.wcm.TLAdmin.acceptQuotation = function (jobId) {
    CQ.Ext.Msg.show({
        title: 'Send for quotation?',
        msg: 'Do you want to submit the job for translation?',
        buttons: CQ.Ext.Msg.YESNO,
        fn: function (submitVal) {
            if (submitVal == "yes") {
                handleQuotationRequest("accept", jobId);
            }
        },
        animEl: 'elId',
        icon: CQ.Ext.MessageBox.QUESTION
    });

};
CQ.wcm.TLAdmin.rejectQuotation = function (jobId) {
    CQ.Ext.Msg.show({
        title: 'Remove Job?',
        msg: 'Are you sure to permanently remove the reference to this job',
        buttons: CQ.Ext.Msg.YESNO,
        fn: function (submitVal) {
            if (submitVal == "yes") {
                handleQuotationRequest("reject", jobId);
            }
        },
        animEl: 'elId',
        icon: CQ.Ext.MessageBox.QUESTION
    });

};
function handleQuotationRequest(selector, jobId) {
    CQ.Ext.getCmp("quotationBox").close();
    CQ.Notification.notify(null, "Your request is under process.. Please do not refresh page..");
    $.ajax({
        url: "/bin/quotationJob." + selector + ".json?jobId=" + jobId + "&requestType=translation",
        type: "POST",
        success: function (response, textStatus, jqXHR) {
            if (selector == "reject") {
                CQ.Notification.notify("Congratulations", "Job has been cleared.",.3);
            }
            else if (selector == "accept") {
                CQ.Notification.notify("Congratulations", "Job has been sent for translation",.3);
            }
            CQ.wcm.TLAdmin.quotationStore.reload();
            CQ.Ext.getCmp("cq-tladmin-grid").getStore().reload();
            CQ.Ext.getCmp("cq-tladmin-grid").getView().refresh();

        },
        error: function (jqXHR, textStatus, errorThrown) {
            CQ.Notification.notify(null, "Sorry :) check logs some thing went wrong!!!");
        }
    });
}

CQ.wcm.TLAdmin.quotationStore = new CQ.Ext.data.GroupingStore({
    "proxy": new CQ.Ext.data.HttpProxy({
        "method": "GET",
        "url": "/bin/fetchJobs.all.json",
        sortOnLoad: false,
        remoteSort: false
    }),
    "reader": new CQ.Ext.data.JsonReader({
        "fields": [ "jobId", "title" , "pagePath", "language", "languageNiceName", "status", "createdOn", "jobNiceName", "jobEndDate"],
        "root": "data",
        "totalProperty": "results"
    }),
    groupField: 'jobId'
});
CQ.wcm.TLAdmin.quotationItemHandler = function () {

//    CQ.wcm.TLAdmin.quotationStore.reload();
    var quotationBox = new CQ.Ext.Window({
        id: "quotationBox",
        title: "Jobs",
        layout: 'fit',
        width: 800,
        height: 450,
        x: "250",
        y: "100",
        closable: true,
        tbar: [
            {
                "jcr:primaryType": "cq:Widget",
                "id": "transStatus",
                defaultValue: "Select status",
                "value": "Select status",
                "type": "select",
                "xtype": "selection",
                "options": [
                    {"text": "In Translation", "value": "in_translation"},
                    {"text": "In Quotation", "value": "in_quotation"},
                    {"text": "Translated", "value": "translated"}
                ]
            },
            {
                "jcr:primaryType": "cq:Widget",
                "id": "languages",
                defaultValue: "Select language",
                "value": "Select language",
                "type": "select",
                "xtype": "selection",
                "options": "/bin/languages.src.json"
            },
            {
                "jcr:primaryType": "cq:Widget",
                "id": "jobNameFilter",
                "xtype": "textfield",
                "emptyText": "Job Id Filter"
            },
            {
                "text": "Submit",
                "xtype": "button",
                "id": "submit",
                "handler": function () {
                    var langCode = CQ.Ext.getCmp('languages').getValue();
                    var status = CQ.Ext.getCmp('transStatus').getValue();
                    var jobFilter = CQ.Ext.getCmp('jobNameFilter').getValue();
                    if (status === "Select status" || langCode === "Select language") {
                        if (jobFilter !== "") {
                            var jobsGrid = CQ.Ext.getCmp('jobsGrid');
                            jobsGrid.getStore().proxy.api.read.url = "/bin/fetchJobs.all.json?jobIdFilter=" + jobFilter;
                            jobsGrid.getStore().load();
                        }
                        else {
                            CQ.Notification.notify("Error!", "Please select status and language");
                        }
                    } else {
                        var jobsGrid = CQ.Ext.getCmp('jobsGrid');
                        jobsGrid.getStore().proxy.api.read.url = "/bin/fetchJobs." + status + ".json?langCode=" + langCode + "&jobIdFilter=" + jobFilter;
                        jobsGrid.getStore().load();
                    }
                }
            },
            {
                "text": "Reset",
                "id": "reset",
                "xtype": "button",
                "handler": function () {
                    CQ.Ext.getCmp("transStatus").setValue("Select status");
                    CQ.Ext.getCmp("languages").setValue("Select language");
                    CQ.Ext.getCmp('jobNameFilter').setValue("");
                    var jobsGrid = CQ.Ext.getCmp('jobsGrid');
                    jobsGrid.getStore().proxy.api.read.url = "/bin/fetchJobs.all.json";
                    jobsGrid.getStore().load();
                }
            }
        ],
        items: [
            new CQ.Ext.grid.GridPanel({
                view: new CQ.Ext.grid.GroupingView({
                    forceFit: true,
                    hideGroupedColumn: true,
                    enableNoGroups: false
                }),
                id: "jobsGrid",
                store: CQ.wcm.TLAdmin.quotationStore,
                width: 700,
                height: 450,
                loadMask: true,
                collapsible: false,
                animCollapse: false,
                iconCls: 'icon-grid',
                colModel: new CQ.Ext.grid.ColumnModel({
                    columns: [
                        {
                            header: 'Title',
                            sortable: false,
                            dataIndex: 'title'
                        },
                        {
                            id: "pageId",
                            text: 'Item Id',
                            header: "Page Path",
                            sortable: false,
                            tdCls: 'task',
                            dataIndex: 'pagePath',
                            hideable: false,
                            renderer: function (value, metaData, record, rowIdx, colIdx, store, view) {
                                if (record.data.status == "received_quotation" && record.json.pageId == "total") {
                                    return "Cost : " + record.json.jobCost
                                }
                                else if (record.json.pageId == "total") {
                                    return ""
                                }
                                return value;
                            }
                        },
                        {
                            header: 'Language',
                            id: 'Language',
                            sortable: false,
                            dataIndex: 'languageNiceName'
                        },
                        {
                            id: 'Status',
                            header: 'Status',
                            sortable: false,
                            dataIndex: 'status',
                            renderer: function (value, metaData, record, rowIdx, colIdx, store, view) {
                                if (record.data.status == "received_quotation" && record.json.pageId == "total") {
                                    return record.json.wordCount + " words"
                                }
                                else if (record.json.pageId == "total") {
                                    return ""
                                }
                                var statusMap = {"translated": "Translated", "not_translated": "Not Translated", "in_translation": "In Translation", "received_quotation": "Received Quotation", "in_quotation": "In Quotation"};
                                return statusMap[value];
                            }

                        },
                        {
                            header: 'Created On',
                            id: 'createdOn',
                            sortable: false,
                            groupName: "createdOn",
                            dataIndex: 'createdOn',
                            renderer: function (value, metaData, record, rowIdx, colIdx, store, view) {
                                var retVal = ""
                                if (record.json.pageId == "total") {
                                    if (record.data.status == "received_quotation") {
                                        retVal = retVal + "<a class='beebox-job-link' href=javascript:void(0) onclick=CQ.wcm.TLAdmin.acceptQuotation('" + record.data.jobId + "')><img src='/etc/clientlibs/beebox/widgets/images/accept.png' title='Accept and Send for translation'/></a> "
                                    }

                                    retVal = retVal + "<a class='beebox-job-link' href=javascript:void(0) onclick=CQ.wcm.TLAdmin.rejectQuotation('" + record.data.jobId + "')><img src='/etc/clientlibs/beebox/widgets/images/reject.png' title='Reject and remove job'/></a>"
                                    return retVal
                                }
                                return value;
                            }

                        },
                        {
                            header: 'Job',
                            sortable: false,
                            groupName: "Job",
                            dataIndex: 'jobId',
                            renderer: function (value, metaData, record, rowIdx, colIdx, store, view) {
                                var r = value
                                if (record.data.jobNiceName) {
                                    r = r + " - Label: " + record.data.jobNiceName
                                }
                                if (record.data.jobEndDate) {
                                    r = r + " - Deadline: " + record.data.jobEndDate
                                }
                                return r
                            }
                        }
                    ],
                    defaults: {
                        sortable: true,
                        menuDisabled: false
                    }
                }),
                bbar: new CQ.Ext.PagingToolbar({
                    pageSize: 15,
                    store: CQ.wcm.TLAdmin.quotationStore,
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
                })
            })
        ],
        modal: true
    });

    quotationBox.show();

};

CQ.wcm.TLAdmin.quotationStore.reload();