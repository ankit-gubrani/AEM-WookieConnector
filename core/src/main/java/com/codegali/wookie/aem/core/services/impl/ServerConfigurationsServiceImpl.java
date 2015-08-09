package com.codegali.wookie.aem.core.services.impl;

import com.codegali.wookie.aem.core.services.ServerConfigurationsService;
import org.apache.felix.scr.annotations.*;
import org.osgi.service.component.ComponentContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Dictionary;

@Service(ServerConfigurationsService.class)
@Component(label = "AEM-Wookie connector configuration", description = "",
        enabled = true, immediate = true, metatype = true)
public class ServerConfigurationsServiceImpl implements ServerConfigurationsService {

    private String wookieServerEndpoint;
    private String apiKey;
    private String sharedDataKey;

    private static final Logger LOGGER = LoggerFactory.getLogger(ServerConfigurationsServiceImpl.class);

    @Property(label = "Wookie Server Endpoint", description = "",
            value = "http://localhost:8080/wookie")
    private static final String WOOKIE_SERVER_ENDPOINT = "wookie.server.endpoint";

    @Property(label = "API Key", description = "The key issued to a particular application",
            value = "TEST")
    private static final String API_KEY = "api.key";

    @Property(label = "Shared Data Key", description = "The key generated by an application representing a specific " +
            "context (e.g. a page, post, section, group or other identified context)",
            value = "mysharedkey")
    private static final String SHARED_DATA_KEY = "shared.data.key";

    @Activate
    protected void activate(ComponentContext componentContext) {
        wookieServerEndpoint = (String) componentContext.getProperties().get(WOOKIE_SERVER_ENDPOINT);
        sharedDataKey = (String) componentContext.getProperties().get(SHARED_DATA_KEY);
        apiKey = (String) componentContext.getProperties().get(API_KEY);

        LOGGER.info(String.format("Setting server configration for AEM Wookie connector as Wookie server endpoint = %s, " +
                "shared data key %s, api key = %s", wookieServerEndpoint, sharedDataKey, apiKey));
    }

    @Modified
    protected void modified(ComponentContext componentContext) {
        activate(componentContext);
        LOGGER.info("Modified server configuration for AEM Wookie connector.");
    }

    @Override
    public String getWookieServerEndPoint() {
        return wookieServerEndpoint;
    }

    @Override
    public String getApiKey() {
        return apiKey;
    }

    @Override
    public String getSharedDataKey() {
        return sharedDataKey;
    }
}
