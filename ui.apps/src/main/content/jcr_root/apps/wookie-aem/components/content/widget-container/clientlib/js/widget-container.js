/*
 * AEM-Wookie Connector tool
 * Copyright 2015 Ankit Gubrani
 * @license
 */
;
(function ($) {
    $.fn.getwidgetInstance = function (widgetId, userId) {
        return this.each(function () {
            var item = $(this);

            var submitSharedKeyBtn = item.find('.shared-data-key .submit-button');
            var editBtn = item.find('.shared-data-key .edit-button');
            var sharedKeyText = item.find('.shared-data-key input[type="text"]');
            var sharedKeyDiv = item.find('.shared-key-text');

            if (submitSharedKeyBtn.length > 0) {
                submitSharedKeyBtn.on('click', function () {
                    item.find('.error').text("");
                    if(sharedKeyText.val() == '') {
                        item.find('.error').text("Please provide a Shared Key! Blank not allowed");
                    } else {
                        registerWidget(widgetId, userId, sharedKeyText.val());
                        //Hiding the submit button
                        submitSharedKeyBtn.addClass('no-display');
                        sharedKeyText.addClass('no-display');

                        //Showing the edit button
                        sharedKeyDiv.removeClass('no-display');
                        editBtn.removeClass('no-display');
                        sharedKeyDiv.text("Shared Data Key : " + sharedKeyText.val());
                    }
                });
            } else {
                registerWidget(widgetId, userId, '');
            }

            if (editBtn.length > 0) {
                editBtn.on('click', function () {
                    editBtn.addClass('no-display');
                    sharedKeyDiv.addClass('no-display');

                    submitSharedKeyBtn.removeClass('no-display');
                    sharedKeyText.removeClass('no-display');
                });
            }

            function registerWidget(widgetId, userId, sharedDataKey) {
                var widgetInstance = {};
                $.ajax({
                    method: "POST",
                    url: "/bin/aem-wookie.widgetinstances.html",
                    data: {'widgetid': widgetId, 'userid': userId, 'shareddatakey': sharedDataKey},
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
                    data: {'widgetid': widgetId, 'userid': userId,
                        'participant_thumbnail_url': '/wookie/deploy/wookie.apache.org/widgets/simplechat/default_thumbnail.png',
                        participant_role: 'host', 'id_key': widgetInstance.instanceId}
                }).done(function () {
                        var iframe = item.find('.widget_frame');
                        iframe.attr('src', widgetInstance.instanceUrl);
                        iframe.attr('width', widgetInstance.width);
                        iframe.attr('height', widgetInstance.height);
                        iframe.removeClass('no-display');
                    });
            }
        });
    }
})(jQuery);