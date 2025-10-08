import requests
import json

url = "http://localhost/api/templates/add/"

f = open("template_data.json", "r")
data = json.loads(f.read())
f.close()
id_ = 2
for dat_ in data.keys():

    payload = json.dumps({
    "id": id_,
    "name": data[dat_]["study_name"],
    "description": data[dat_]["study_name"],
    "template_text": data[dat_]["templates"][0]["template_data"].replace("\n", "<br>"),
    "template_html": data[dat_]["templates"][0]["template_data"].replace("\n", "<br>")
    })
    headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE3MzkxNzAyOTF9.6UkHbcbsQ6Umw912X4NRmbjbpDA9kQ6dOII7ETdiEbc'
    }
    print(payload)
    response = requests.request("POST", url, headers=headers, data=payload)

    print(response.text)
    id_ += 1
