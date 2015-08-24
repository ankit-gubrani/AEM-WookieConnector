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
%>
<c:set var="uuid" value="<%= UUID.randomUUID().toString() %>" />
<c:set var="userId" value="<%= userId %>" />
<c:set var="widgetId" value="<%= widgetId %>" />
<div id="${uuid}"></div>
<h2>${properties.title}</h2>
<c:choose>
    <c:when test="${empty widgetId}">
        <div>Please select a widget</div>
    </c:when>
    <c:when test="${empty userId}">
        <div>Please select a user</div>
    </c:when>
    <c:otherwise>
    </c:otherwise>
</c:choose>
<c:choose>
    <c:when test="${not empty widgetId && not empty userId}">
        <div class="result">
            <iframe name="widget_frame" class="widget_frame" src="about:blank"></iframe>
        </div>
    </c:when>
    <c:otherwise>
        <%
            if (WCMMode.fromRequest(request) == WCMMode.EDIT) {
                String classicPlaceholder =
                        "<img src=\"/libs/cq/ui/resources/0.gif\" class=\"cq-file-placeholder " + ddClassName + "\" alt=\"\">";
                String placeholder = Placeholder.getDefaultPlaceholder(slingRequest, component, classicPlaceholder,
                        ddClassName, null);

        %><%= placeholder %><%
        }
    %>
    </c:otherwise>
</c:choose>

<script type="text/javascript">
    $('#${uuid}').closest('.widget-container').getwidgetInstance("${widgetId}", "${userId}");
</script>