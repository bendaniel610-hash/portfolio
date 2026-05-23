import requests
from bs4 import BeautifulSoup
import json
import re

url = "https://www.pinterest.com/pin/1131177631449821124/"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9"
}

try:
    response = requests.get(url, headers=headers, timeout=15)
    print("Status code:", response.status_code)
    
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # 1. Search for OpenGraph image and video
    og_img = soup.find("meta", property="og:image")
    og_video = soup.find("meta", property="og:video")
    og_title = soup.find("meta", property="og:title")
    og_desc = soup.find("meta", property="og:description")
    
    print("\n--- OpenGraph Meta ---")
    print("Title:", og_title["content"] if og_title else "None")
    print("Description:", og_desc["content"] if og_desc else "None")
    print("Image:", og_img["content"] if og_img else "None")
    print("Video:", og_video["content"] if og_video else "None")
    
    # 2. Search for JSON-LD or script tags containing pin details
    scripts = soup.find_all("script", type="application/ld+json")
    print("\n--- JSON-LD Script Tags found:", len(scripts))
    for i, s in enumerate(scripts):
        try:
            data = json.loads(s.string)
            print(f"\nJSON-LD [{i}]:")
            print(json.dumps(data, indent=2)[:500] + "...")
        except Exception as e:
            print("Error parsing JSON:", e)

    # 3. Look for script tags with PINTEREST_APP_STATE
    print("\n--- Searching for PINTEREST_APP_STATE ---")
    for s in soup.find_all("script"):
        if s.string and "initialReduxState" in s.string:
            print("Found initialReduxState script tag!")
            # Extract links
            links = re.findall(r'https://[a-zA-Z0-9.-]+\.pinimg\.com/[a-zA-Z0-9_./-]+', s.string)
            print("Found pinimg links:", list(set(links))[:10])
            break

except Exception as e:
    print("Error during fetch:", e)
