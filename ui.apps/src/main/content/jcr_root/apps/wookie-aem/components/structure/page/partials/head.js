

// Server-side JavaScript for the head.html logic
use(function () {
    var WCMUtils = Packages.com.day.cq.wcm.commons.WCMUtils;
    var resourceResolver = resource.getResourceResolver();

    return {
        keywords: WCMUtils.getKeywords(currentPage, false),
        favIcon: resourceResolver.getResource(currentDesign.getPath() + "/favicon.ico")
    };
});