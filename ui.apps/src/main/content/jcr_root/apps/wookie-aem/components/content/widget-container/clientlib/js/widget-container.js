;
(function ($) {
    $.fn.getwidgetInstance = function (widgetId, userId) {
        return this.each(function () {
            var item = $(this);
            $.ajax({
                method: "POST",
                url: "/bin/aem-wookie.widgetinstances.html",
                data: {'widgetid': widgetId, 'userid': userId},
                success: function (response) {
                    var responseJson = JSON.parse(response);
                    console.log(responseJson);
                    WidgetInstance.setInstanceUrl(responseJson.widgetdata.url);
                    WidgetInstance.setWidth(responseJson.widgetdata.width);
                    WidgetInstance.setHeight(responseJson.widgetdata.height);
                    WidgetInstance.setInstanceId(responseJson.widgetdata.identifier);
                },
                async: false
            });
            //Registering the user with the given widget ID
            $.ajax({
                method: "POST",
                url: "/bin/aem-wookie.participants.html",
                data: {'widgetid': widgetId, 'userid': userId, 'participant_display_name': userId,
                    'participant_id': userId, 'participant_thumbnail_url': 'test', participant_role : 'host','id_key': WidgetInstance.instanceId}
            }).done(function () {
                    var iframe = item.find('.widget_frame');
                    iframe.attr('src', WidgetInstance.instanceUrl);
                    iframe.attr('width', WidgetInstance.width);
                    iframe.attr('height', WidgetInstance.height);
                });
        });
    }
})(jQuery);

var WidgetInstance = {
    instanceUrl: null,
    instanceId: null,
    width: 250,
    height: 250,
    setInstanceUrl: function (instanceUrl) {
        this.instanceUrl = instanceUrl;
    },
    setWidth: function (width) {
        this.width = width;
    },
    setHeight: function (height) {
        this.height = height;
    },
    setInstanceId: function(instanceId) {
        this.instanceId = instanceId;
    }
}