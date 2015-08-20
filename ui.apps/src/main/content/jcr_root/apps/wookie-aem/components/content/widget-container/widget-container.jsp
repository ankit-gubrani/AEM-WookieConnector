<%--

  Wookie Widget Container component.

  Wookie Widget Container

--%><%
%><%@include file="/libs/foundation/global.jsp"%><%
%><%@page session="false" %>
<%@ page import="com.day.cq.commons.Doctype,
    com.day.cq.wcm.api.components.DropTarget,
    com.day.cq.wcm.foundation.Image, com.day.cq.wcm.foundation.Placeholder,com.day.cq.wcm.api.WCMMode,java.util.UUID" %>
<cq:includeClientLib categories="wookie-aem.widget-container" />
<%
    String ddClassName = DropTarget.CSS_CLASS_PREFIX + "wookiewidgets";

    String widgetId = properties.get("wookieWidget", String.class);
    String userId = properties.get("userid", String.class);

    if(widgetId != null && !"".equals(widgetId) && userId != null && !"".equals(userId)) {
        out.println(widgetId);
        out.println(userId);
    } else {
        if (WCMMode.fromRequest(request) == WCMMode.EDIT) {
            String classicPlaceholder =
                    "<img src=\"/libs/cq/ui/resources/0.gif\" class=\"cq-file-placeholder " + ddClassName + "\" alt=\"\">";
            String placeholder = Placeholder.getDefaultPlaceholder(slingRequest, component, classicPlaceholder,
                    ddClassName, null);

%><%= placeholder %><%
        }
    }
%>
<c:set var="uuid" value="<%= UUID.randomUUID().toString() %>" />
<c:set var="userId" value="<%= userId %>" />
<c:set var="widgetId" value="<%= widgetId %>" />
<div id="${uuid}"></div>
<div class=".result">
    <iframe name="widget_frame" class="widget_frame" src="about:blank"></iframe>
</div>
<script type="text/javascript">
    $('#${uuid}').closest('.widget-container').getwidgetInstance("${widgetId}", "${userId}");
</script>

