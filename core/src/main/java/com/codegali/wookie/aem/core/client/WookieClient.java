/**
 *
 * AEM-Wookie Connector tool
 * Copyright 2015 Ankit Gubrani & Rima mittal
 *
 **/
package com.codegali.wookie.aem.core.client;

import com.codegali.wookie.aem.core.util.ApplicationConstants;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.conn.HttpHostConnectException;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.message.BasicNameValuePair;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class WookieClient {

    private static final Logger LOGGER = LoggerFactory.getLogger(WookieClient.class);

    private String wookieServerEndpoint;
    private String apiKey;

    public WookieClient(final String wookieServerEndpoint, final String apiKey) {
        this.apiKey = apiKey;
        this.wookieServerEndpoint = wookieServerEndpoint;
    }

    /**
     * This method is used to make GET request to the configured server end point.
     *
     * @param apiUrl      API URL to perform desired operation on the server.
     * @param queryParams Query parameters to be make successful with Get request.
     * @return Returns response in HashMap
     */
    public Map makeGetRequest(final String apiUrl, final String queryParams) {
        Map<String, String> responseMap = new HashMap<String, String>();
        try {
            if (isConfigurationValid()) {
                HttpClient httpClient = HttpClientBuilder.create().build();

                HttpGet getRequest = new HttpGet(wookieServerEndpoint + apiUrl + "?" + queryParams + "&" +
                        ApplicationConstants.API_KEY_QUERY_PARAM + "=" + apiKey);

                LOGGER.info("GET Request made was : " + getRequest.toString());

                HttpResponse httpResponse = httpClient.execute(getRequest);

                if (httpResponse != null && httpResponse.getStatusLine() != null) {
                    LOGGER.info("AEM-Wookie Connector : Client made Get call, Status code is: " + httpResponse.getStatusLine().getStatusCode());

                    if(httpResponse.getStatusLine().getStatusCode() == 404) {
                        responseMap.put(ApplicationConstants.RESPONSE_KEY, " Status code 404 ! Please check if Wookie server is up and running !");
                        responseMap.put(ApplicationConstants.RESPOSE_STATUS_CODE,
                                Integer.toString(httpResponse.getStatusLine().getStatusCode()));
                        return responseMap;
                    } else if (httpResponse.getStatusLine().getStatusCode() != 200) {
                        //Runtime exception is thrown if status code is not 200
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
            LOGGER.error("ClientProtocolException occurred in Wookie client : ", e);
        }  catch (HttpHostConnectException e) {
            LOGGER.info("HttpHostConnectException occurred in Wookie client : ", e);
            responseMap.put(ApplicationConstants.RESPONSE_KEY, " Please check if Wookie server is up and running ! HttpHostConnectException occurred");
            responseMap.put(ApplicationConstants.RESPOSE_STATUS_CODE, ApplicationConstants.RESPONSE_SERVER_NOT_WORKING_STATUS_CODE);
            return responseMap;
        }
        catch (IOException e) {
            LOGGER.error("IOException occurred in Wookie client while making a GET call : ", e);
        }
        return responseMap;
    }

    /**
     * This method is used to make POST request to the configured server end point.
     *
     * @param apiUrl           API URL on which post request will be mode.
     * @param postQueryParams  List of query parameters to be sent along post request.
     * @return
     */
    public Map<String, String> makePostRequest(final String apiUrl, final List<NameValuePair> postQueryParams) {
        Map<String, String> responseMap = new HashMap<String, String>();
        try {
            if (isConfigurationValid()) {
                HttpClient httpClient = HttpClientBuilder.create().build();

                HttpPost postRequest = new HttpPost(wookieServerEndpoint+apiUrl);

                postQueryParams.add(new BasicNameValuePair(ApplicationConstants.API_KEY_QUERY_PARAM, apiKey));

                postRequest.setEntity(new UrlEncodedFormEntity(postQueryParams));

                HttpResponse httpResponse = httpClient.execute(postRequest);

                if (httpResponse != null && httpResponse.getStatusLine() != null) {
                    LOGGER.info("AEM-Wookie Connector : Client made Post call, Status code is: " + httpResponse.getStatusLine().getStatusCode());

                    if(httpResponse.getStatusLine().getStatusCode() == 404) {
                        responseMap.put(ApplicationConstants.RESPONSE_KEY, " Status code 404 ! Please check if Wookie server is up and running !");
                        responseMap.put(ApplicationConstants.RESPOSE_STATUS_CODE,
                                Integer.toString(httpResponse.getStatusLine().getStatusCode()));
                        return responseMap;
                    } else if (httpResponse.getStatusLine().getStatusCode() == 200 || httpResponse.getStatusLine().getStatusCode() == 201) {
                        //Status code 200 is returned if widget instance already exists and 201 is returned if new widget instance is created
                        BufferedReader br = new BufferedReader(new InputStreamReader(httpResponse.getEntity().getContent()));

                        String output;
                        StringBuffer responseBuffer = new StringBuffer();

                        while ((output = br.readLine()) != null) {
                            responseBuffer.append(output);
                        }
                        LOGGER.info("-------"+responseBuffer.toString());
                        if("".equals(responseBuffer.toString())) {
                            responseMap.put(ApplicationConstants.RESPONSE_KEY, "{final-status : request make successfully}");
                        } else {
                            responseMap.put(ApplicationConstants.RESPONSE_KEY, responseBuffer.toString());
                        }


                        responseMap.put(ApplicationConstants.RESPOSE_STATUS_CODE, "200");
                        responseMap.put(ApplicationConstants.RESPONSE_FORMAT_KEY, ApplicationConstants.JSON_CONTENT_TYPE_RESPONSE);

                        if(httpResponse != null && httpResponse.getEntity() != null && httpResponse.getEntity().getContentType() != null) {
                            responseMap.put(ApplicationConstants.RESPONSE_FORMAT_KEY, httpResponse.getEntity().
                                    getContentType().toString());
                            responseMap.put(ApplicationConstants.RESPOSE_STATUS_CODE,
                                    Integer.toString(httpResponse.getStatusLine().getStatusCode()));
                        }
                    } else {
                        //Runtime exception is thrown if status code is not 200(Already exists) or 201 (Created)
                        throw new RuntimeException("Failed : HTTP error code : "
                                + httpResponse.getStatusLine().getStatusCode());
                    }
                }
                postRequest.releaseConnection();
            }  else {
                LOGGER.info("Wookie server configuration made in the AEM instance is not valid");
                responseMap.put(ApplicationConstants.RESPONSE_KEY, ApplicationConstants.INVALID_CONFIG_RESPONSE_STATUS);
            }
        } catch (ClientProtocolException e) {
            LOGGER.error("ClientProtocolException occurred in Wookie client : ", e);
        }  catch (HttpHostConnectException e) {
            //HttpHostConnectException occurs if wookie server is not running and returns given response code
            LOGGER.info("HttpHostConnectException occurred in Wookie client : ", e);
            responseMap.put(ApplicationConstants.RESPONSE_KEY, " Please check if Wookie server is up and running ! HttpHostConnectException occurred");
            responseMap.put(ApplicationConstants.RESPOSE_STATUS_CODE, ApplicationConstants.RESPONSE_SERVER_NOT_WORKING_STATUS_CODE);
            return responseMap;
        }
        catch (IOException e) {
            LOGGER.error("IOException occurred in Wookie client while making a Post call : ", e);
        }
        return responseMap;
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

        return isValid;
    }
}
