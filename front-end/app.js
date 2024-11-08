document.addEventListener('DOMContentLoaded', async function () {
    const API_BASE_URL = 'http://127.0.0.1:5002';

    const playlistsList = document.getElementById('playlists-list');
    const dbSongsList = document.getElementById('db-songs-list');
    const paginationControls = document.getElementById('pagination-controls');
    const searchButton = document.getElementById('search-button');
    const artistSearch = document.getElementById('artist-search');
    const createPlaylistInput = document.getElementById('new-playlist-name');
    const createPlaylistButton = document.getElementById('submit-playlist');
    const spotifyPaginationControls = document.getElementById('spotify-pagination-controls');

    async function fetchAPI(url, options = {}) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`Erreur : ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    }

    async function getSpotifySongsByArtist(artist, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const data = await fetchAPI(`${API_BASE_URL}/spotify_songs?artist=${artist}&offset=${offset}&limit=${limit}`);
        if (data) {
            const totalPages = Math.ceil(data.total_songs / limit);
            displaySpotifySongs(data.songs, page, totalPages, artist);
        }
    }

    function displaySpotifySongs(songs, page, totalPages, artist) {
        searchResults.innerHTML = songs.length ? '' : '<li>Aucune chanson trouvée.</li>';
        songs.forEach(song => {
            const li = document.createElement('li');
            li.textContent = `${song.name} - ${song.artist} (${song.album})`;
            const addButton = document.createElement('button');
            addButton.textContent = '+';
            addButton.onclick = () => addSongsToDB(song);
            li.appendChild(addButton);
            searchResults.appendChild(li);
        });
        setupPagination(spotifyPaginationControls, page, totalPages, (i) => getSpotifySongsByArtist(artist, i));
    }

    async function addSongsToDB(song) {
        const data = await fetchAPI(`${API_BASE_URL}/add_spotify_songs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ songs: [{ name: song.name, artist: song.artist, album: song.album }] })
        });
        if (data) getSongsFromDB();
    }

    async function getSongsFromDB(page = 1, perPage = 5) {
        const data = await fetchAPI(`${API_BASE_URL}/songs?page=${page}&per_page=${perPage}`);
        if (data) {
            dbSongsList.innerHTML = '';
            data.songs.forEach(song => {
                const songItem = document.createElement('li');
                songItem.innerHTML = `${song.name} - ${song.artist} (${song.album})`;
                songItem.appendChild(createButtonContainer(song.id));
                dbSongsList.appendChild(songItem);
            });
            await getAllPlaylists();
        }
        setupPagination(paginationControls, page, data.pages, getSongsFromDB);
    }

    function setupPagination(container, currentPage, totalPages, callback) {
        container.innerHTML = '';
        for (let page = 1; page <= totalPages; page++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = `Page ${page}`;
            pageButton.disabled = page === currentPage;
            pageButton.onclick = () => callback(page);
            container.appendChild(pageButton);
        }
    }

    function createButtonContainer(songId) {
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container');
        buttonContainer.innerHTML = `
            <button onclick="editSongTitle(${songId})"><i class="fas fa-edit"></i></button>
            <button onclick="deleteSong(${songId})"><i class="fas fa-trash"></i></button>
            <select class="playlist-select" onchange="addSongToPlaylist(${songId}, this.value)">
                <option value="" disabled selected>Ajouter à une playlist</option>
            </select>`;
        return buttonContainer;
    }

    async function editSongTitle(songId) {
        const newName = prompt("Entrez le nouveau titre de la chanson :");
        if (!newName) return;
        const data = await fetchAPI(`${API_BASE_URL}/songs/${songId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName })
        });
        if (data) {
            getSongsFromDB();
            showAlert("Titre de la chanson mis à jour avec succès !", "success");
        } else {
            showAlert("Échec de la mise à jour du titre. Veuillez réessayer.", "error");
        }
    }

    async function deleteSong(songId) {
        if (!confirm("Voulez-vous vraiment supprimer cette chanson ?")) return;
        const data = await fetchAPI(`${API_BASE_URL}/songs/${songId}`, { method: 'DELETE' });
        if (data) getSongsFromDB();
    }

    async function addSongToPlaylist(songId, playlistId) {
        const data = await fetchAPI(`${API_BASE_URL}/playlists/${playlistId}/add_song`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ song_id: songId })
        });
        if (data) {
            showAlert("Chanson ajoutée à la playlist avec succès !", "success");
        } else {
            showAlert("Échec de l'ajout de la chanson. Veuillez réessayer.", "error");
        }
    }

    async function getAllPlaylists() {
        const data = await fetchAPI(`${API_BASE_URL}/playlists`);
        if (data) {
            playlistsList.innerHTML = '';
            displayPlaylists(data);
        }
    }

    function displayPlaylists(playlists) {
        playlists.forEach(playlist => {
            const playlistItem = document.createElement('li');
            playlistItem.textContent = playlist.name;
            playlistItem.appendChild(createPlaylistButtons(playlist.id, playlist.name));
            playlistsList.appendChild(playlistItem);
        });
    }

    function createPlaylistButtons(playlistId, playlistName) {
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container');
        buttonContainer.innerHTML = `
            <button onclick="viewPlaylistDetails(${playlistId})"><i class="fas fa-eye"></i></button>
            <button onclick="editPlaylistName(${playlistId}, '${playlistName}')"><i class="fas fa-edit"></i></button>
            <button onclick="deletePlaylist(${playlistId})"><i class="fas fa-trash"></i></button>`;
        return buttonContainer;
    }

    async function viewPlaylistDetails(playlistId) {
        const data = await fetchAPI(`${API_BASE_URL}/playlists/${playlistId}`);
        if (data) {
            const playlistDetails = document.createElement('div');
            playlistDetails.id = 'playlist-details';
            playlistDetails.innerHTML = `<h3>Détails de la Playlist: ${data.name}</h3>`;
            const songList = document.createElement('ul');
            if (data.songs && data.songs.length > 0) {
                data.songs.forEach(song => {
                    const songItem = document.createElement('li');
                    songItem.innerHTML = `${song.name} - ${song.artist} (${song.album})`;
                    songItem.appendChild(createButtonContainer(song.id));
                    songList.appendChild(songItem);
                });
            } else {
                songList.innerHTML = "<li>Aucune chanson dans cette playlist.</li>";
            }
            playlistDetails.appendChild(songList);
            document.getElementById('playlists-container').appendChild(playlistDetails);
        }
    }

    async function editPlaylistName(playlistId, currentName) {
        const newName = prompt("Entrez le nouveau nom de la playlist :", currentName);
        if (!newName) return;
        const data = await fetchAPI(`${API_BASE_URL}/playlists/${playlistId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName })
        });
        if (data) {
            getAllPlaylists();
            showAlert("Nom de la playlist mis à jour avec succès !", "success");
        } else {
            showAlert("Échec de la mise à jour du nom de la playlist. Veuillez réessayer.", "error");
        }
    }

    async function deletePlaylist(playlistId) {
        if (!confirm("Voulez-vous vraiment supprimer cette playlist ?")) return;
        const data = await fetchAPI(`${API_BASE_URL}/playlists/${playlistId}`, { method: 'DELETE' });
        if (data) {
            getAllPlaylists();
            showAlert("Playlist supprimée avec succès !", "success");
        } else {
            showAlert("Échec de la suppression de la playlist. Veuillez réessayer.", "error");
        }
    }

    createPlaylistButton.onclick = async () => {
        const playlistName = createPlaylistInput.value;
        if (!playlistName) {
            alert("Veuillez entrer un nom pour la playlist.");
            return;
        }
        const data = await fetchAPI(`${API_BASE_URL}/playlists`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: playlistName })
        });
        if (data) {
            createPlaylistInput.value = '';
            getAllPlaylists();
        }
    };

    searchButton.onclick = () => {
        const artist = artistSearch.value;
        if (artist) getSpotifySongsByArtist(artist);
    };

    window.viewPlaylistDetails = viewPlaylistDetails;
    window.editPlaylistName = editPlaylistName;
    window.deletePlaylist = deletePlaylist;

    function showAlert(message, type = 'success') {
        const alertContainer = document.createElement('div');
        alertContainer.className = `alert alert-${type}`;
        alertContainer.textContent = message;
        setTimeout(() => alertContainer.remove(), 3000);
    }

    await getSongsFromDB();
});
