package migration

import (
	"encoding/csv"
	"log"
	"os"
	"path/filepath"
	"search-esdb-service/config"
	"search-esdb-service/data"
	"search-esdb-service/database"
	"search-esdb-service/record/entities"
	"search-esdb-service/record/helper"
	"search-esdb-service/record/repositories"
	"strings"

	"github.com/elastic/go-elasticsearch/v8"
)

const (
	CREATE_INDEX_ICU_TOKENIZER = `
{
  "settings": {
    "index": {
      "analysis": {
        "analyzer": {
          "analyzer_shingle": {
            "tokenizer": "icu_tokenizer",
            "filter": ["filter_shingle"]
          }
        },
        "filter": {
          "filter_shingle": {
            "type": "shingle",
            "max_shingle_size": 3,
            "min_shingle_size": 2,
			"output_unigrams": true
          }
        }
      }
    }
  },
    "mappings": {
    "properties": {
      "youtubeURL": {
        "type": "text"
      },
      "question": {
        "type": "text",
        "analyzer": "analyzer_shingle"
      },
      "answer": {
        "type": "text",
        "analyzer": "analyzer_shingle"
      },
      "startTime": {
        "type": "text"
      },
      "endTime": {
        "type": "text"
      }
    }
  }
}
`
)

// Migration steps
// Create index named `record`; if not exists else return
// Convert file in csv format to json format from data folder
// insert json to es
// ------------------------------

// RecordMigrate migrates records to Elasticsearch.
//
// Takes a *config.Config and a database.Database as parameters.
// Does not return anything.
func RecordMigrate(cfg *config.Config, es database.Database) {
	client := es.GetDB()
	indexName := "record"
	exists, err := indexExists(client, indexName)
	if err != nil {
		panic(err)
	}
	if exists {
		log.Println("---------DATA ALREADY EXISTS---------")
		return // index already exists
	}

	// Create the index
	log.Println("INDEX DOES NOT EXIST, CREATING INDEX")
	res, err := client.Indices.Create(
		indexName,
		client.Indices.Create.WithBody(strings.NewReader(CREATE_INDEX_ICU_TOKENIZER)),
	)
	if err != nil {
		panic(err)
	}
	log.Print("CREATING INDEX RESPONSE: ", res)

	// Convert csv file
	log.Println("CONVERTING CSV-----------")
	records, err := ConvertCSVFilesInDirectory(cfg)
	if err != nil {
		panic(err)
	}

	log.Println("CHECKING CLUSTER HEALTH")
	es.CheckClusterHealth()
	
	log.Println("INSERTING DATA TO ES-----------")
	// bulk insert records to es
	recordESRepository := repositories.NewRecordESRepository(es.GetDB())
	if err := recordESRepository.BulkInsert(records); err != nil {
		panic(err)
	}

	log.Printf("Successfully migrated %d records\n", len(records))
}

// indexExists checks if the index exists using the Indices.Exists API.
//
// It takes a client *elasticsearch.Client and an indexName string as parameters.
// It returns a bool indicating whether the index exists and an error if any.
func indexExists(client *elasticsearch.Client, indexName string) (bool, error) {
	// Check if the index exists using the Indices.Exists API
	res, err := client.Indices.Exists([]string{indexName})
	if err != nil {
		log.Println("Error checking if the index exists:", err)
		return false, err
	}
	log.Println("INDEX EXISTS : " ,res.StatusCode != 404)
	return res.StatusCode != 404, nil
}

// ConvertCSVFilesInDirectory converts CSV files in the specified
// directory into a slice of entities.Record structs.
//
// It takes a directory path as a parameter and returns a slice of
// entities.Record structs and an error.
func ConvertCSVFilesInDirectory(cfg *config.Config) ([]*entities.Record, error) {
	
	dataDirPath := cfg.Static.DataPath + cfg.Static.RecordPath
	
	dir,err := data.GetRecordCSVFilesEntry(cfg)
	if err != nil {
		return nil, err
	}

	var records []*entities.Record

	log.Println("CONVERTING CSV TO JSON")
	// Read Files in directory (in case more than 1 file)
	for _, entry := range dir {
		// Check if the entry is a regular file and has a .csv extension
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".csv") {
			continue
		}

		// Build the full path to the CSV file
		csvFilePath := filepath.Join(dataDirPath, entry.Name())
		fileName := strings.TrimSuffix(entry.Name(), ".csv")

		// Insert data from the CSV file
		r, err := generateDataFromCSV(csvFilePath, fileName)
		if err != nil {
			log.Printf("Error inserting data from CSV file %s: %s\n", csvFilePath, err)
			continue // Continue to the next file if there's an error
		}
		records = append(records, r...)
	}

	return records, nil
}

// generateDataFromCSV generates a slice of entities.Record structs from a CSV file.
//
// Parameters:
// - filePath: the path to the CSV file.
// - fileName: the name of the CSV file.
//
// Returns:
// - []*entities.Record: a slice of entities.Record structs representing the CSV records.
// - error: an error if there was a problem reading the CSV file.
func generateDataFromCSV(filePath string, fileName string) ([]*entities.Record, error) {
	// Open the CSV file
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	// Create a CSV reader
	reader := csv.NewReader(file)

	// Read and discard the header line
	if _, err := reader.Read(); err != nil {
		return nil, err
	}

	// FOR BULKING
	var qaRecords []*entities.Record
	// Read CSV records and insert them into Elasticsearch
	for {
		record, err := reader.Read()
		if err != nil {
			// End of file
			break
		}
		//Empty Record
		ch := false
		for i := range record {
			if record[i] == "" {
				ch = true
				break
			}
		}
		if ch {
			continue
		}

		// Remove newline characters from the fields
		for i := range record {
			record[i] = helper.EscapeText(record[i])
		}

		// Escape . to : in record[2] and record[3] (starttime and endtime)
		record[2] = strings.ReplaceAll(record[2], ".", ":")
		record[3] = strings.ReplaceAll(record[3], ".", ":")

		// Assuming your CSV columns are in the order: Question, Answe``r, StartTime, EndTime
		qar := &entities.Record{
			Index:      record[4],
			YoutubeURL: record[5],
			Question:   record[0],
			Answer:     record[1],
			StartTime:  record[2],
			EndTime:    record[3],
		}

		qaRecords = append(qaRecords, qar) // FOR BULKING
	}

	return qaRecords, nil
}
