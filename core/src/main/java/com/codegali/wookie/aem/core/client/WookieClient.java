package com.codegali.wookie.aem.core.client;

import com.codegali.wookie.aem.core.util.ApplicationConstants;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.conn.HttpHostConnectException;
import org.apache.http.impl.client.HttpClientBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

public class WookieClient {

    private static final Logger LOGGER = LoggerFactory.getLogger(WookieClient.class);

    private String wookieServerEndpoint;
    private String apiKey;
    private String sharedDataKey;

    public WookieClient(final String wookieServerEndpoint, final String apiKey, final String sharedDataKey) {
        this.apiKey = apiKey;
        this.wookieServerEndpoint = wookieServerEndpoint;
        this.sharedDataKey = sharedDataKey;
    }

    /**
     * This method is used to make GET request to the configured server end point.
     *
     * @param apiUrl      API URL to perform desired operation on the server.
     * @param queryParams Query parameters to be make successful with Get request.
     * @return Returns response in string
     */
    public Map makeGetRequest(final String apiUrl, final String queryParams) {
        Map<String, String> responseMap = new HashMap<String, String>();
        try {
            if (isConfigurationValid()) {
                HttpClient httpClient = HttpClientBuilder.create().build();

                HttpGet getRequest = new HttpGet(wookieServerEndpoint + apiUrl + "?" + queryParams + "&" +
                        ApplicationConstants.API_KEY_QUERY_PARAM + apiKey
                        + "&" + ApplicationConstants.SHARED_DATA_QUERY_PARAM + sharedDataKey);

                LOGGER.info("GET Request made was : " + getRequest.toString());

                HttpResponse httpResponse = httpClient.execute(getRequest);

                if (httpResponse != null && httpResponse.getStatusLine() != null) {
                    LOGGER.info("AEM-Wookie Connector : Client made Get call Status code is: " + httpResponse.getStatusLine().getStatusCode());

                    if(httpResponse.getStatusLine().getStatusCode() == 404) {
                        responseMap.put(ApplicationConstants.RESPONSE_KEY, " Status code 404 ! Please check if Wookie server is up and running !");
                        responseMap.put(ApplicationConstants.RESPOSE_STATUS_CODE,
                                Integer.toString(httpResponse.getStatusLine().getStatusCode()));
                        return responseMap;
                    } else if (httpResponse.getStatusLine().getStatusCode() != 200) {
                        throw new RuntimeException("Failed : HTTP error code : "
                                + httpResponse.getStatusLine().getStatusCode());
                    }

                    BufferedReader br = new BufferedReader(new InputStreamReader(httpResponse.getEntity().getContent()));

                    String output;
                    StringBuffer responseBuffer = new StringBuffer();

                    while ((output = br.readLine()) != null) {
                        responseBuffer.append(output);
                    }
                    responseMap.put(ApplicationConstants.RESPONSE_KEY, responseBuffer.toString());
                    responseMap.put(ApplicationConstants.RESPONSE_FORMAT_KEY, httpResponse.getEntity().
                            getContentType().toString());
                    responseMap.put(ApplicationConstants.RESPOSE_STATUS_CODE,
                            Integer.toString(httpResponse.getStatusLine().getStatusCode()));
                }
                getRequest.releaseConnection();
            } else {
                LOGGER.info("Wookie server configuration made in the AEM instance is not valid");
                responseMap.put(ApplicationConstants.RESPONSE_KEY, ApplicationConstants.INVALID_CONFIG_RESPONSE_STATUS);
            }
        }catch (ClientProtocolException e) {
            e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
        }  catch (HttpHostConnectException e) {
            LOGGER.info("HttpHostConnectException occurred in Wookie client : ", e);
            responseMap.put(ApplicationConstants.RESPONSE_KEY, " Please check if Wookie server is up and running ! HttpHostConnectException occurred");
            responseMap.put(ApplicationConstants.RESPOSE_STATUS_CODE, "404");
            return responseMap;
        }
        catch (IOException e) {
            e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
        }
        return responseMap;
    }

    /**
     * @param apiUrl
     * @return
     */
    public String makePostRequest(final String apiUrl) {

        try {
            HttpClient httpClient = HttpClientBuilder.create().build();

            //Add other required fields
            HttpPost postRequest = new HttpPost(wookieServerEndpoint);

            LOGGER.info("POST Request made was : " + postRequest.toString());
        } catch (Exception e) {
            LOGGER.error("Exception occurred in MakePOSTRequest Method : ", e);
        }

        return null;
    }

    /**
     * @param apiUrl
     * @return
     */
    public String makePutRequest(final String apiUrl) {
        try {
            HttpClient httpClient = HttpClientBuilder.create().build();

            //Add other required fields
            HttpPut putRequest = new HttpPut(wookieServerEndpoint);

            LOGGER.info("PUT Request made was : " + putRequest.toString());
        } catch (Exception e) {
            LOGGER.error("Exception occurred in MakePUTRequest Method : ", e);
        }
        return null;
    }

    /**
     * @param apiUrl
     * @return
     */
    public String makeDeleteRequest(final String apiUrl) {
        try {
            HttpClient httpClient = HttpClientBuilder.create().build();

            //Add other required fields
            HttpDelete deleteRequest = new HttpDelete(wookieServerEndpoint);

            LOGGER.info("DELETE Request made was : " + deleteRequest.toString());
        } catch (Exception e) {
            LOGGER.error("Exception occurred in MakeDELETERequest Method : ", e);
        }
        return null;
    }

    /**
     * This method is to check if wookie server configuration made in the AEM instance is valid or not
     *
     * @return true for valid configuration and false for invalid
     */
    private boolean isConfigurationValid() {
        boolean isValid = true;

        if (!wookieServerEndpoint.startsWith("http")) {
            isValid = false;
        }

        if ("".equals(apiKey)) {
            isValid = false;
        }

        if ("".equals(sharedDataKey)) {
            isValid = false;
        }

        return isValid;
    }
}
