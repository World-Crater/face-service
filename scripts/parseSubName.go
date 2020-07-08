package main

import (
	"errors"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"

	"github.com/antchfx/htmlquery"
)

const URL = ""
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
		page = "page-" + page + ".html"
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

func appendTextToFile(text string) {
	f, err := os.OpenFile("parseSubName.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Println(err)
	}
	defer f.Close()
	if _, err := f.WriteString(text + "\n"); err != nil {
		log.Println(err)
	}
}

func getSubName(ID string, HTML string) []string {
	doc, _ := htmlquery.Parse(strings.NewReader(HTML))
	list := htmlquery.Find(doc, `//*[@id="`+ID+`"]/h2/a`)
	var result []string
	for _, n := range list {
		result = append(result, htmlquery.InnerText(n))
	}
	return result
}

func getAllSubNameID(HTML string) []string {
	re := regexp.MustCompile(`id="(e\d+)`)
	var result []string
	for _, s := range re.FindAllStringSubmatch(HTML, -1) {
		result = append(result, s[1])
	}
	return result
}

func normalizationSubNameFormat(subNames string) []string {
	re := regexp.MustCompile(`^[^\d+（]+`)
	var result []string
	split := strings.Split(subNames, "＝")
	for _, s := range split {
		for _, s2 := range re.FindAllStringSubmatch(s, -1) {
			if s2[0] == "素人" {
				continue
			}
			result = append(result, s2[0])
		}
	}
	return result
}

type Result struct {
	subName [][]string
	index   int
}

func main() {
	var finalAnsFinal [][]string
	channel := make(chan Result, PAGE+1)

	for i := 0; i <= PAGE; i++ {
		go func(channel chan<- Result, i int) {
			pageHTML, err := getPageHTML(strconv.Itoa(i))
			if err != nil {
				log.Fatal(err)
			}
			var finalAns [][]string
			for _, s := range getAllSubNameID(pageHTML) {
				for _, s2 := range getSubName(s, pageHTML) {
					r := normalizationSubNameFormat(s2)
					if len(r) != 1 {
						finalAns = append(finalAns, normalizationSubNameFormat(s2))
					}
				}
			}
			channel <- Result{subName: finalAns, index: i}
		}(channel, i)
	}

	var channelReturnCount = 0
	for result := range channel {
		for _, s := range result.subName {
			finalAnsFinal = append(finalAnsFinal, s)
		}
		if channelReturnCount == PAGE {
			break
		}
		channelReturnCount++
	}
	close(channel)

	for _, s := range finalAnsFinal {
		appendTextToFile(strings.Join(s, ", "))
	}
}
