import os

from bs4 import BeautifulSoup
import requests
import re

startPage = 1
endPage = 50
htmlRoot = "http://www.minnano-av.com/"
ImgHtmlRoot = "http://www.minnano-av.com"

def reptile(pageNumber):
    girlPictureAndName = getNewGirl("http://www.minnano-av.com/actress_list.php?page=" + pageNumber)
    print("page" + pageNumber + "\n")
    print(girlPictureAndName + "\n")
    # writeFile(girlPictureAndName)

def getNewGirl(listhtmlurl):
    result = ""
    listhtmlurl = requests.get(listhtmlurl)
    listSoup = BeautifulSoup(listhtmlurl.text)
    url = ""
    allImgItem = listSoup.find_all("img")
    for imgItem in allImgItem:
        hrefStr = str(imgItem.get('src'))
        if re.findall("^p_actress.*jpg", hrefStr):
            name = imgItem.get('alt')
            name = re.sub('[【].*[】]||[（].*[）]||[(].*[)]', '', name)
            nameArray = name.split('＝', 1)
            name = ''
            for s in nameArray:
                name = name + s + ','
            if name == ',': # 有出現名字只有【登録重複】因為不算是名字所以跳過
                continue
            result = result + name + htmlRoot + hrefStr + "\n"
    return result

def writeFile(allResult):
    file = open(os.getcwd() + '/data/minnanoPage'+str(startPage)+'-'+str(endPage)+'.txt', 'a')
    file.write(allResult)

if __name__ == '__main__':
    for i in range(startPage,endPage+1):
        reptile(str(i))
