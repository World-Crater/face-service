from bs4 import BeautifulSoup
import requests
import re

startPage = 1
endPage = 100

def reptile(pageNumber):
    html = requests.get("https://tw.wav.tv/actresses/top-trending/page:" + pageNumber)
    soup = BeautifulSoup(html.text)
    allImg = soup.find_all('img')
    for item in allImg:
        result = ''
        imgSrcStr = getImgSrc(item)
        if imgSrcStr != "":
            name = getGirlName(item)
            result = result + name + imgSrcStr + '\n'
            print(result)
            writeFile(result)

def getImgSrc(imgItem):
    imgSrc = str(imgItem.get('src'))
    if imgSrc.find('https://images') != -1:
        return imgSrc
    else:
        return ""

def getGirlName(imgItem):
    altStr = str(imgItem.get('alt'))
    name = re.findall(r"[^\x00-\x7F]+|^[a-zA-Z \-\(\)]+", altStr)
    nameStr = ''
    for i in name:
        nameStr = nameStr + i + ','
    return nameStr

def writeFile(allResult):
    file = open('/home/suzumiya/Top'+str(startPage)+'-'+str(endPage)+'.txt', 'a')
    file.write(allResult)

if __name__ == '__main__':
    for i in range(startPage,endPage+1):
        reptile(str(i))
