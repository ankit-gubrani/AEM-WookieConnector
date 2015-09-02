/**
 *
 * Copyright 2015 Ankit Gubrani & Rima mittal
 *
 **/
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

    private static final Logger LOGGER = LoggerFactory.getLogger(ServerConfigurationsServiceImpl.class);

    @Property(label = "Wookie Server Endpoint", description = "",
            value = "http://localhost:8080/wookie")
    private static final String WOOKIE_SERVER_ENDPOINT = "wookie.server.endpoint";

    @Property(label = "API Key", description = "The key issued to a particular application",
            value = "TEST")
    private static final String API_KEY = "api.key";

    @Activate
    protected void activate(ComponentContext componentContext) {
        wookieServerEndpoint = (String) componentContext.getProperties().get(WOOKIE_SERVER_ENDPOINT);
        apiKey = (String) componentContext.getProperties().get(API_KEY);

        LOGGER.info(String.format("Setting server configration for AEM Wookie connector as Wookie server endpoint = %s, " +
                " api key = %s", wookieServerEndpoint, apiKey));
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
}
