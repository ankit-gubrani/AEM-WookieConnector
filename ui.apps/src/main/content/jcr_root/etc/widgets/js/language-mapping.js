CQ.wcm.TLAdmin.loadLanguages = function (callback) {
    $.getJSON(CQ.shared.HTTP.encodePath("/bin/languages.all.json"))
        .done(function (response) {
            CQ.wcm.TLAdmin.languageMappingJSON = response.dialog
            CQ.wcm.TLAdmin.allLanguages = response.languages
            if (callback) {
                callback()
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log("Request Failed: " + err);
        });

}

CQ.wcm.TLAdmin.languageMappingDialogListener = function () {
    var beeBoxServerDialog = {
        "jcr:primaryType": "cq:Dialog",
        "title": CQ.I18n.getMessage("Wordbee Beebox Target Language Mapping"),
        "id": "languageMappingDialog",
        "height": 420,
        closable: false,
        modal: true,
        "items": CQ.wcm.TLAdmin.languageMappingJSON,
        "buttons": {
            "jcr:primaryType": "cq:WidgetCollection",
            "custom": {
                "text": CQ.I18n.getMessage("Submit"),
                "handler": function () {
                    var languageMapping = {}
                    $.each(CQ.wcm.TLAdmin.allLanguages, function (idx, value) {
                        var currentLangField = CQ.Ext.getCmp("languageCode_" + value).getValue()
                        languageMapping[value] = currentLangField
                    })
                    console.log(languageMapping)
                    CQ.HTTP.post(CQ.shared.HTTP.encodePath("/etc/beebox-configuration/beeboxLanguageMapping"),
                        function (options, success, response) {
                            if (success) {
                                CQ.Notification.notify(null, "Successfully saved....");
                                dialog.close();
                                CQ.wcm.TLAdmin.loadLanguages();
                            }
                        }, languageMapping);
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
    dialog.show();
}

CQ.wcm.TLAdmin.loadLanguages();

CQ.wcm.TLAdmin.aboutUsListener = function () {
    var quotationBox = new CQ.Ext.Window({
        title: 'About',
        layout: 'fit',
        width: 600,
        height: 400,
        x: "350",
        y: "100",
        closable: true,
        preventBodyReset: true,
        html: '<div class="beebox-about-us-container"><p><img src="/etc/clientlibs/beebox/widgets/images/wordbee.jpg"></p><h1>Wordbee Beebox for Adobe AEM/CQ5</h1><p>Version 1.00</p><p>© 2015 Wordbee SA</p><p>All rights reserved.</p><p class="about-link"><a href="http://www.beeboxlinks.com" target="_blank">www.beeboxlinks.com</a></p><p class="about-link"><a href="http://www.wordbee.com" target="_blank">www.wordbee.com</a></p><p class="wordbee-license">License: Use of this product requires a valid license from Wordbee SA.</p><p class="warning-message">Warning: This computer program is protected by copyright law and international treaties. Unauthorized reproduction or distribution of this program, or any portion of it, may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under the law.</p></div>',
        modal: true
    });
    quotationBox.show();

}
