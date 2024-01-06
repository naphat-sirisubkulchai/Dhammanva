package database

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/elastic/go-elasticsearch/v8"
	"github.com/elastic/go-elasticsearch/v8/esapi"
)

// checkClusterHealth is a function that checks the health of the Elasticsearch cluster.
//
// It takes a client of type *elasticsearch.Client as a parameter.
// The function does not return anything.
func checkClusterHealth(client *elasticsearch.Client) {
	// Create a request to check the cluster health
	req := esapi.ClusterHealthRequest{
		Pretty: true,
	}

	// Perform the request
	res, err := req.Do(context.Background(), client)
	if err != nil {
		fmt.Printf("Error checking cluster health: %s", err)
		return
	}
	defer res.Body.Close()

	// Check the response status
	if res.IsError() {
		fmt.Printf("Error: %s", res.Status())
		return
	}

	// Print the cluster health information
	fmt.Println("Elastic Cluster Health:")
	fmt.Println("---------------")
	fmt.Printf("Status: %s\n", res.Status())

}

// checkPlugins checks the installed plugins in Elasticsearch.
//
// It takes a `client` parameter of type `*elasticsearch.Client` which is used to
// perform the request to check the installed plugins.
//
// It returns an error if there is an error performing the request or decoding the
// JSON response. It also returns an error if no plugins are installed.
func checkPlugins(client *elasticsearch.Client) error {
	// Create a request to check the installed plugins
	req := esapi.CatPluginsRequest{
		Format: "json", // Use JSON format for the response
	}

	// Perform the request
	res, err := req.Do(context.Background(), client)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	// Check the response status
	if res.IsError() {
		return fmt.Errorf("Elasticsearch error: %s", res.Status())
	}

	// Decode the JSON response
	var plugins []map[string]interface{}
	if err := json.NewDecoder(res.Body).Decode(&plugins); err != nil {
		return err
	}

	if len(plugins) == 0 {
		return fmt.Errorf("No plugins installed")
	}
	// Print the list of installed plugins
	for _, plugin := range plugins {
		fmt.Printf("Name: %s, Component: %s, Version: %s\n", plugin["name"], plugin["component"], plugin["version"])
	}

	return nil
}