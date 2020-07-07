package main

import (
	"errors"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"
	"sync"
)

const URL = "http://etigoya955.blog49.fc2.com"
const PAGE = 97

func check(err error) {
	if err != nil {
		panic(err)
	}
}

func getPageHTML(page string) (string, error) {
	if page == "0" {
		page = ""
	} else {
		page = "/page-" + page + ".html"
	}

	var client http.Client
	resp, err := client.Get(URL + page)
	if err != nil {
		log.Fatal(err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		bodyBytes, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			log.Fatal(err)
		}
		bodyString := string(bodyBytes)
		return bodyString, nil
	}
	return "", errors.New("Fail get page. Status is " + strconv.Itoa(resp.StatusCode))
}

func writeFile(pageHTML string, fileName string) {
	f, err := os.OpenFile(fileName, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatal(err)
	}
	if _, err := f.Write([]byte(pageHTML)); err != nil {
		log.Fatal(err)
	}
	if err := f.Close(); err != nil {
		log.Fatal(err)
	}
}

func main() {
	var wg sync.WaitGroup

	wg.Add(PAGE)
	for i := 0; i <= PAGE; i++ {
		go func(i int) {
			pageHTML, err := getPageHTML(strconv.Itoa(i))
			if err != nil {
				log.Fatal(err)
			}
			writeFile(pageHTML, "./subNamePage/"+strconv.Itoa(i)+".txt")
			wg.Done()
		}(i)
	}
	wg.Wait()
}
