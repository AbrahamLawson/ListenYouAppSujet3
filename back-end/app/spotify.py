import requests
import base64
import os
import time
from dotenv import load_dotenv
load_dotenv()

spotify_token = None
token_expiration_time = 0

def get_spotify_token():
    global spotify_token
    global token_expiration_time

    if spotify_token and time.time() < token_expiration_time:
        return spotify_token

    client_id = os.getenv('SPOTIFY_CLIENT_ID')
    client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
    
    auth_str = f"{client_id}:{client_secret}"
    b64_auth_str = base64.b64encode(auth_str.encode()).decode()
    
    headers = {
        'Authorization': f'Basic {b64_auth_str}',
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    
    data = {
        'grant_type': 'client_credentials'
    }
    
    response = requests.post('https://accounts.spotify.com/api/token', headers=headers, data=data)
    response_data = response.json()

    spotify_token = response_data['access_token']
    token_expiration_time = time.time() + response_data['expires_in'] - 60  # On enlève 60 secondes pour être prudent

    return spotify_token


def get_spotify_songs(artist_name, page=1, limit=10):
    token = get_spotify_token()
    headers = {
        'Authorization': f'Bearer {token}'
    }

    search_url = 'https://api.spotify.com/v1/search'
    params = {
        'q': artist_name,
        'type': 'track',
        'limit': limit,
        'offset': offset
    }
    
    response = requests.get(search_url, headers=headers, params=params)
    
    if response.status_code == 200:
        songs = response.json()['tracks']['items']
        
        result = []
        for song in songs:
            result.append({
                'name': song['name'],
                'album': song['album']['name'],
                'artist': song['artists'][0]['name'],
                'popularity': song['popularity']
            })

        return result
    else:
        return None

# Test
if __name__ == "__main__":
    artist = "Chris Brown"
    songs = get_spotify_songs(artist)
    
    if songs:
        for song in songs:
            print(f"Title: {song['name']}, Album: {song['album']['name']}, Artist: {song['artists'][0]['name']}, Popularity: {song['popularity']}")
    else:
        print(f"Could not fetch songs for artist {artist}")
