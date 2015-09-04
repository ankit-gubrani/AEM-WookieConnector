
// Server-side JavaScript for the topnav logic
use(function () {
    var items = [];
    var root = currentPage.getAbsoluteParent(1);
    var currentNavPath = currentPage.getAbsoluteParent(2).getPath();
    var it = root.listChildren(new Packages.com.day.cq.wcm.api.PageFilter());

    while (it.hasNext()) {
        var page = it.next();

        // No strict comparison, because the types returned from the Java APIs
        // don't strictly match the JavaScript types
        var selected = (page.getPath() == currentNavPath);

        items.push({
            page: page,
            selected : selected
        });
    }

    return {
        items: items
    };
});