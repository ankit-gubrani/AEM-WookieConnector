/*
* Copyright 2015 Ankit Gubrani
* @license
 */
;
(function ($) {
    $.fn.getwidgetInstance = function (widgetId, userId) {
        return this.each(function () {
            var item = $(this);
            var widgetInstance = {};
            $.ajax({
                method: "POST",
                url: "/bin/aem-wookie.widgetinstances.html",
                data: {'widgetid': widgetId, 'userid': userId},
                success: function (response) {
                    var responseJson = JSON.parse(response);
                    console.log(responseJson);
                    widgetInstance.instanceUrl = responseJson.widgetdata.url;
                    widgetInstance.width = responseJson.widgetdata.width;
                    widgetInstance.height = responseJson.widgetdata.height;
                    widgetInstance.instanceId = responseJson.widgetdata.identifier;
                },
                async: false
            });
            //Registering the user with the given widget ID
            $.ajax({
                method: "POST",
                url: "/bin/aem-wookie.participants.html",
                data: {'widgetid': widgetId, 'userid': userId, 'participant_display_name': userId,
                    'participant_id': userId, 'participant_thumbnail_url': '/wookie/deploy/wookie.apache.org/widgets/simplechat/default_thumbnail.png',
                    participant_role : 'host','id_key': widgetInstance.instanceId}
            }).done(function () {
                    var iframe = item.find('.widget_frame');
                    iframe.attr('src', widgetInstance.instanceUrl);
                    iframe.attr('width', widgetInstance.width);
                    iframe.attr('height', widgetInstance.height);
                });
        });
    }
})(jQuery);