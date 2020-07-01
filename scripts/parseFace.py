from bs4 import BeautifulSoup
import requests


def gethtml(pageNumber):
    html = requests.get("https://tw.wav.tv/actresses/best-ranked/page:" + pageNumber)
    soup = BeautifulSoup(html.text)
    allImg = soup.find_all('img')
    result = ''
    imageSrc = ''
    name = ''
    for link in allImg:
        imageSrc = str(link.get('src'))
        if imageSrc.find('https://images') != -1:
            # print(imageSrc)
            name = str(link.get('alt'))
            nameEndPlace = name.find(' - ')
            if (nameEndPlace == -1):
                nameEndPlace = name.find(', ')
            name = name[0:nameEndPlace]
            # print(name[0:nameEndPlace])
            result = result + name + ', ' + imageSrc + '\n'
    print(result)
    writeFile(result)

def writeFile(all):
    file = open('/home/suzumiya/aa.txt', 'a')
    file.write(all)

if __name__ == '__main__':
    for i in range(1,51):
        gethtml(str(i))
