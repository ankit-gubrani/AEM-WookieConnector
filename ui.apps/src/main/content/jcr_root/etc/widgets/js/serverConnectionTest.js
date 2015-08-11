function testConnection(callback) {
    var mask = new CQ.Ext.LoadMask(CQ.Ext.getBody(), {
        msg: "Connection checking : please wait....."
    });
    mask.show();
    $.ajax({
        url: "/bin/testConnection",
        type: "POST",
        dataType: 'text',
        data: CQ.wcm.TLAdmin.getParams(),
        success: function (response, textStatus, jqXHR) {
            CQ.Notification.notify(null, "Congratulations :) Your Configuration is correct!!!");
            mask.hide();
            callback(true);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            CQ.Notification.notify(null, "Sorry :) Check your configuration!!!");
            mask.hide();
            callback(false);
        }
    });
}

function validation() {
    var url = CQ.Ext.getCmp('serverUrl').getValue(),
        projectKey = CQ.Ext.getCmp('projectKey').getValue(),
        userName = CQ.Ext.getCmp("userName").getValue(),
        password = CQ.Ext.getCmp("password").getValue();
    if (url === "" || projectKey === "" || userName === "" || password === "") {
        return false;
    }
    return true;
}
CQ.wcm.TLAdmin.getParams = function () {
    var url = CQ.Ext.getCmp('serverUrl').getValue(),
        projectKey = CQ.Ext.getCmp('projectKey').getValue(),
        userName = CQ.Ext.getCmp("userName").getValue(),
        password = CQ.Ext.getCmp("password").getValue(),
        aemLanguage = CQ.Ext.getCmp('sourceLang').getValue();
    var params = {"userName": userName, "password": password, "projectKey": projectKey,
        "serverUrl": url, "aemLanguage": aemLanguage
    };
    return params;
}

CQ.wcm.TLAdmin.beeboxDialogListener = function () {
    var beeBoxServerDialog = {
        "jcr:primaryType": "cq:Dialog",
        "title": CQ.I18n.getMessage("Beebox Translation Management Settings"),
        "id": CQ.Util.createId("cq-beeBoxServerDialog"),
        "height": 420,
        closable: false,
        modal: true,
        "items": {
            "jcr:primaryType": "cq:Panel",
            "items": {
                "jcr:primaryType": "cq:WidgetCollection",
                "sourceLang": {
                    "xtype": "selection",
                    "type": "select",
                    "options": "/bin/languages.src.json",
                    "fieldLabel": CQ.I18n.getMessage("Source language:"),
                    "fieldDescription": "Choose language and see the Beebox server configuration.",
                    "name": "language",
                    "id": "sourceLang",
                    "listeners": {
                        "jcr:primaryType": "nt:unstructured",
                        "selectionchanged": function (box, value) {
                            var response = CQ.HTTP.get("/etc/beebox-configuration/beeboxConfig/" + value + ".json"),
                                projectKey = "", serverUrl = "", userName = "", password = "";
                            if (response.status == 200) {
                                var data = CQ.Util.eval(response);
                                if (data) {
                                    projectKey = (data.projectKey);
                                    serverUrl = (data.serverUrl);
                                    userName = (data.userName);
                                    password = (data.password);
                                }
                            }

                            CQ.Ext.getCmp('projectKey').setValue(projectKey);
                            CQ.Ext.getCmp('serverUrl').setValue(serverUrl);
                            CQ.Ext.getCmp('userName').setValue(userName);
                            CQ.Ext.getCmp('password').setValue(password);
                        }} },
                "basic": {
                    "jcr:primaryType": "cq:Widget",
                    "id": "infoSet",
                    "title": "Beebox Server Configuration",
                    "xtype": "dialogfieldset",
                    "collapsed": false,
                    "collapsible": true,
                    "items": {
                        "jcr:primaryType": "cq:WidgetCollection",
                        "note": {
                            "jcr:primaryType": "cq:Widget",
                            "fieldLabel": CQ.I18n.getMessage("Note"),
                            "id":"serverSettingNote",
                            "fieldDescription": CQ.I18n.getMessage("Please supply connection details to the Beebox server that handles translations for the selected source language.")
                        },
                        "ServerUrl": {
                            "jcr:primaryType": "cq:Widget",
                            "xtype": 'textfield',
                            "fieldLabel": CQ.I18n.getMessage("Server URL:"),
                            "name": "serverUrl",
                            "id": "serverUrl",
                            "allowBlank": false
                        },
                        "projectKey": {
                            "jcr:primaryType": "cq:Widget",
                            "xtype": 'textfield',
                            "fieldLabel": CQ.I18n.getMessage("Project key:"),
                            "name": "projectKey",
                            "id": "projectKey",
                            "allowBlank": false
                        },
                        "UserName": {
                            "fieldLabel": CQ.I18n.getMessage("Login:"),
                            "xtype": 'textfield',
                            "name": "userName",
                            "id": "userName",
                            "allowBlank": false
                        },
                        "Password": {
                            "jcr:primaryType": "cq:Widget",
                            "xtype": 'password',
                            "fieldLabel": CQ.I18n.getMessage("Password:"),
                            "name": "password",
                            "id": "password",
                            "allowBlank": false
                        }
                    } }}  },
        "buttons": {
            "jcr:primaryType": "cq:WidgetCollection",
            "test": {
                "text": CQ.I18n.getMessage("Test"),
                "handler": function () {
                    if (validation()) {
                        testConnection(function (value) {
                            console.log("test connection" + value);
                        });
                    }
                }
            },
            "custom": {
                "text": CQ.I18n.getMessage("Submit"),
                "handler": function () {
                    if (validation()) {
                        testConnection(function (value) {
                            console.log("test connection" + value);
                            if (value) {
                                CQ.HTTP.post(CQ.shared.HTTP.encodePath("/etc/beebox-configuration/beeboxConfig/" + CQ.Ext.getCmp('sourceLang').getValue()),
                                    function (options, success, response) {
                                        if (success) {
                                            dialog.close();
                                        }
                                    }, CQ.wcm.TLAdmin.getParams());
                            }
                        });
                    }
                }
            },
            "cancel": {
                "text": CQ.I18n.getMessage("Cancel"),
                "handler": function () {
                    dialog.close();
                }
            }
        }
    };
    var dialog = CQ.WCM.getDialog(beeBoxServerDialog);
    console.log(dialog)
    dialog.show();
}
