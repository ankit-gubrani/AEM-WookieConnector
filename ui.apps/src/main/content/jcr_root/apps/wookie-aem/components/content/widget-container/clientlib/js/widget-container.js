;
(function ($) {
    $.fn.getwidgetInstance = function (widgetId, userId) {
        return this.each(function(){

            var item = $(this);

            var iframe = item.find('.widget_frame');

            console.log(iframe);
            alert(widgetId);
            alert(userId);
            $.ajax({
                method: "GET",
                url: "/bin/get/aem-wookie.widgetinstances.html",
                data: {'widgetid': widgetId, 'userid':userId},
                success: function(response){
                    var responseJson = JSON.parse(response);
                    alert("This is URL --");
                    alert(responseJson.url);
                    console.log(response);
                    console.log(responseJson);

                    iframe.attr('src', responseJson.url);
                }
            });
        });
    }
})(jQuery);