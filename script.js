const canvas = document.getElementById('memeCanvas');
const ctx = canvas.getContext('2d');
let currentImage = null;
let currentImageBase64 = null;
let currentMemeIndex = null;

document.getElementById('imageUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        currentImageBase64 = event.target.result;
        const img = new Image();
        img.onload = function() {
            currentImage = img;
            currentMemeIndex = null;
            drawMeme();
        };
        img.src = currentImageBase64;
    };
    reader.readAsDataURL(file);
});

document.getElementById('topText').addEventListener('input', drawMeme);
document.getElementById('bottomText').addEventListener('input', drawMeme);
document.getElementById('textColor').addEventListener('input', drawMeme);
document.getElementById('fontSize').addEventListener('input', drawMeme);

function drawMeme() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentImage) {
        ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '22px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillText('📁 Uploade une image pour commencer', canvas.width / 2, canvas.height / 2);
        return;
    }

    const topText = document.getElementById('topText').value.toUpperCase();
    const bottomText = document.getElementById('bottomText').value.toUpperCase();
    const textColor = document.getElementById('textColor').value;
    const fontSize = document.getElementById('fontSize').value;

    ctx.font = `bold ${fontSize}px Impact, Arial Black`;
    ctx.textAlign = 'center';
    ctx.lineWidth = fontSize / 8;

    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.strokeStyle = '#000000';
    ctx.fillStyle = textColor;

    if (topText) {
        ctx.strokeText(topText, canvas.width / 2, parseInt(fontSize) + 15);
        ctx.fillText(topText, canvas.width / 2, parseInt(fontSize) + 15);
    }

    if (bottomText) {
        ctx.strokeText(bottomText, canvas.width / 2, canvas.height - 20);
        ctx.fillText(bottomText, canvas.width / 2, canvas.height - 20);
    }

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

function downloadMeme() {
    if (!currentImage) {
        alert('⚠️ Uploade une image dabord !');
        return;
    }
    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function saveMeme() {
    if (!currentImage) {
        alert('⚠️ Uploade une image dabord !');
        return;
    }

    const memeData = {
        image: currentImageBase64,
        topText: document.getElementById('topText').value,
        bottomText: document.getElementById('bottomText').value,
        textColor: document.getElementById('textColor').value,
        fontSize: document.getElementById('fontSize').value,
        preview: canvas.toDataURL('image/png')
    };

    let gallery = JSON.parse(localStorage.getItem('memes')) || [];

    if (currentMemeIndex !== null) {
        gallery[currentMemeIndex] = memeData;
        alert('✅ Mème modifié dans la galerie !');
    } else {
        gallery.push(memeData);
        alert('✅ Mème sauvegardé dans la galerie !');
    }

    localStorage.setItem('memes', JSON.stringify(gallery));
    currentMemeIndex = null;
    loadGallery();
}

function loadGallery() {
    const galleryDiv = document.getElementById('gallery');
    galleryDiv.innerHTML = '';
    const gallery = JSON.parse(localStorage.getItem('memes')) || [];

    if (gallery.length === 0) {
        galleryDiv.innerHTML = '<p class="text-muted">Aucun mème sauvegardé pour linstant.</p>';
        return;
    }

    gallery.forEach(function(memeData, index) {
        const col = document.createElement('div');
        col.className = 'col-6 col-md-3';
        col.innerHTML = `
            <div class="position-relative">
                <img src="${memeData.preview}" alt="meme ${index + 1}">
                <button onclick="deleteMeme(${index})" 
                    class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1">
                    🗑️
                </button>
                <button onclick="loadMeme(${index})" 
                    class="btn btn-warning btn-sm position-absolute top-0 start-0 m-1">
                    ✏️
                </button>
            </div>
        `;
        galleryDiv.appendChild(col);
    });
}

function loadMeme(index) {
    const gallery = JSON.parse(localStorage.getItem('memes')) || [];
    const memeData = gallery[index];

    document.getElementById('topText').value = memeData.topText;
    document.getElementById('bottomText').value = memeData.bottomText;
    document.getElementById('textColor').value = memeData.textColor;
    document.getElementById('fontSize').value = memeData.fontSize;

    currentMemeIndex = index;
    currentImageBase64 = memeData.image;

    const img = new Image();
    img.onload = function() {
        currentImage = img;
        drawMeme();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    img.src = memeData.image;
}

function deleteMeme(index) {
    let gallery = JSON.parse(localStorage.getItem('memes')) || [];
    gallery.splice(index, 1);
    localStorage.setItem('memes', JSON.stringify(gallery));
    if (currentMemeIndex === index) {
        currentMemeIndex = null;
    }
    loadGallery();
}

function shareMeme() {
    if (!currentImage) {
        alert('⚠️ Uploade une image dabord !');
        return;
    }
    const shareUrl = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('Regarde mon mème ! 😂');
    const options = `
        <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-top:10px">
            <a href="https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}" 
               target="_blank" class="btn btn-dark">🐦 Twitter</a>
            <a href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" 
               target="_blank" class="btn btn-primary">📘 Facebook</a>
            <a href="https://api.whatsapp.com/send?text=${text}" 
               target="_blank" class="btn btn-success">💬 WhatsApp</a>
        </div>
    `;
    const popup = document.createElement('div');
    popup.style.cssText = `
        position: fixed; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        background: white; padding: 30px;
        border-radius: 15px; box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 9999; text-align: center; min-width: 300px;
    `;
    popup.innerHTML = `
        <h5>📤 Partager le mème</h5>
        ${options}
        <button onclick="this.parentElement.remove()" 
            class="btn btn-secondary mt-3 w-100">Fermer</button>
    `;
    document.body.appendChild(popup);
}

function clearCanvas() {
    currentImage = null;
    currentImageBase64 = null;
    currentMemeIndex = null;
    document.getElementById('imageUpload').value = '';
    document.getElementById('topText').value = '';
    document.getElementById('bottomText').value = '';
    document.getElementById('textColor').value = '#ffffff';
    document.getElementById('fontSize').value = '40';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMeme();
}

loadGallery();
drawMeme();