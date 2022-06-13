import csv
import json

#SETUP
projectname = 'Hop'
location = '/Users/alessandrobifulco/Finder/AirdropDataFixer/DataThatNeedsFixing/'+projectname+'.json'
data = json.load(open(location, 'r'))
nameOfAttribute = 'totalTokens'
asciibool = False
decimals = 18

x={}
for key, val in data.items():
    # key = (key)
    amount = int(data.get(key).get(nameOfAttribute))
    if asciibool == True: 
        amount = (int(amount,16))
    amount = round((amount)*(10**-decimals))
    x[key]= {'tokens': amount}
    # setattr(x,key,{'tokens': amount})

print(x)
with open('/Users/alessandrobifulco/Finder/AirdropDataFixer/FixedData/'+projectname +'.json', 'w', encoding='utf-8') as f:
  json.dump(x, f, ensure_ascii=False, indent=4)