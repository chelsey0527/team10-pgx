import requests

API_KEY = "your_autogen_api_key_here"  # Replace with actual API key
API_URL = "https://api.autogen.microsoft.com/generate"  # Replace with actual endpoint

def generate_ai_response(input_text):
    headers = {"Authorization": f"Bearer {API_KEY}"}
    payload = {"input": input_text}

    response = requests.post(API_URL, json=payload, headers=headers)
    response.raise_for_status()  # Raise an error for bad HTTP status codes
    return response.json().get("response", "No response from AutoGen")
