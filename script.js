const lanes = [
    { key: 'a', lane: document.getElementById('lane1'), position: 0 },
    { key: 's', lane: document.getElementById('lane2'), position: 1 },
    { key: 'd', lane: document.getElementById('lane3'), position: 2 },
    { key: 'j', lane: document.getElementById('lane4'), position: 3 },
    { key: 'k', lane: document.getElementById('lane5'), position: 4 },
    { key: 'l', lane: document.getElementById('lane6'), position: 5 }
];

let playerHealth = 100;
let oppHealth = 100;
let playerPosition = 2;  // Posisi awal karakter pemain di lane ke-3
let fase = 'bertahan';   // Fase awal: bertahan
let notes = [];
let gameInterval;
let faseInterval;

// Dapatkan elemen DOM untuk kesehatan dan karakter
const playerHealthBar = document.getElementById('player-health-bar');
const oppHealthBar = document.getElementById('opp-health-bar');
const playerCharacter = document.getElementById('player-character');
const playerHealthText = document.getElementById('player-health-text');
const oppHealthText = document.getElementById('opp-health-text');

// Fungsi untuk memperbarui bar kesehatan dan persentase
function updateHealthBars() {
    // Membatasi kesehatan minimal pada 0 dan maksimal pada 100
    playerHealth = Math.max(0, Math.min(100, playerHealth));
    oppHealth = Math.max(0, Math.min(100, oppHealth));

    // Mengupdate width dari health bar sesuai dengan persentase health
    playerHealthBar.style.width = playerHealth + '%';
    oppHealthBar.style.width = oppHealth + '%';

    // Update teks persentase kesehatan
    playerHealthText.textContent = `Health: ${playerHealth}%`;
    oppHealthText.textContent = `Health: ${oppHealth}%`;
}

// Fungsi untuk memindahkan karakter pemain tepat pada lane yang dipilih
function movePlayer(direction) {
    if (direction === 'left' && playerPosition > 0) {
        playerPosition--;
    } else if (direction === 'right' && playerPosition < lanes.length - 1) {
        playerPosition++;
    }
    playerCharacter.style.left = lanes[playerPosition].lane.offsetLeft + 'px';
}

// Fungsi untuk membuat not
function createNoteForLane(lane) {
    const note = document.createElement('div');
    note.classList.add('note');
    lane.appendChild(note);

    if (fase === 'bertahan') {
        note.style.animationName = 'fall';
        note.style.backgroundColor = 'darkgray'; // Ubah warna note menjadi abu-abu gelap saat bertahan
    } else {
        note.style.animationName = 'rise';
        note.style.backgroundColor = ''; // Kembalikan warna default saat menyerang
    }

    const noteObject = {
        element: note,
        lane: lane,
        isHit: false,
        isMissed: false
    };

    notes.push(noteObject);

    note.addEventListener('animationend', () => {
        if (!noteObject.isHit) {
            if (fase === 'bertahan' && noteObject.lane === lanes[playerPosition].lane) {
                playerHealth -= 10; // Kurangi health jika terkena
                updateHealthBars();
                checkGameOver();  // Cek apakah permainan berakhir
            }
            noteObject.isMissed = true;
        }
        note.remove();
    });
}

// Kontrol karakter di fase bertahan dan menyerang
document.addEventListener('keydown', (event) => {
    if (fase === 'bertahan') {
        if (event.key === 'a') {
            movePlayer('left');
        } else if (event.key === 'd') {
            movePlayer('right');
        }
    } else { // fase === 'menyerang'
        const laneObject = lanes.find(l => l.key === event.key);
        if (laneObject) {
            const activeNote = notes.find(n => !n.isHit && !n.isMissed && n.lane === laneObject.lane);

            if (activeNote) {
                activeNote.isHit = true;
                oppHealth -= 10;  // Kurangi health opponent jika berhasil
                updateHealthBars();
                activeNote.element.remove();
                checkGameOver();  // Cek apakah permainan berakhir setelah serangan
            } else {
                // Player menekan tombol lane yang benar tapi tidak ada not aktif
                playerHealth -= 5;
                updateHealthBars();
                checkGameOver();  // Cek apakah permainan berakhir
            }
        } else {
            // Jika input tidak valid saat fase menyerang
            playerHealth -= 5;  // Kurangi health pemain jika salah input
            updateHealthBars();
            checkGameOver();  // Cek apakah permainan berakhir
        }
    }
});

// Fungsi untuk mengaktifkan not secara acak
function activateRandomNote() {
    const randomLaneIndex = Math.floor(Math.random() * lanes.length);
    createNoteForLane(lanes[randomLaneIndex].lane);
}

// Fungsi untuk mengganti fase
function switchFase() {
    fase = fase === 'bertahan' ? 'menyerang' : 'bertahan';
    document.getElementById('fase').textContent = fase.charAt(0).toUpperCase() + fase.slice(1);
}

// Fungsi untuk memulai permainan
function startGame() {
    playerHealth = 100;
    oppHealth = 100;
    notes = [];
    fase = 'bertahan';
    playerPosition = 2;  // Posisi awal pemain (tengah)

    // Set posisi awal karakter sesuai lane
    playerCharacter.style.left = lanes[playerPosition].lane.offsetLeft + 'px';

    updateHealthBars(); // Memperbarui bar kesehatan

    // Mulai interval untuk membuat not setiap 1 detik
    gameInterval = setInterval(activateRandomNote, 1000);

    // Mulai interval untuk mengganti fase setiap 10 detik
    faseInterval = setInterval(switchFase, 10000);
}

// Fungsi untuk memeriksa apakah permainan berakhir
function checkGameOver() {
    if (playerHealth <= 0) {
        displayGameOver('You Lose');
    } else if (oppHealth <= 0) {
        displayGameOver('You Win');
    }
}

// Fungsi untuk menampilkan pesan akhir permainan
function displayGameOver(message) {
    clearInterval(gameInterval);
    clearInterval(faseInterval);
    // Hapus semua not yang masih aktif
    notes.forEach(note => {
        note.element.remove();
    });
    notes = [];
    // Tampilkan pesan game over
    const gameOverElement = document.getElementById('game-over');
    const gameOverMessage = document.getElementById('game-over-message');
    gameOverMessage.textContent = message;
    gameOverElement.style.display = 'block';
    // Optionally, you can add a button to restart the game
    const restartButton = document.getElementById('restart-button');
    restartButton.style.display = 'block';
    restartButton.addEventListener('click', () => {
        gameOverElement.style.display = 'none';
        restartButton.style.display = 'none';
        startGame();
    });
}

// Mulai permainan pada load
window.onload = startGame;
