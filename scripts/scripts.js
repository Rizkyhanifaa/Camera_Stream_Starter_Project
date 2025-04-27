let width = 320;
let height = 0;

let streaming = false;
let currentStream;

async function startup() {
  const cameraVideo = document.getElementById('camera-video'); 
  const cameraCanvas = document.getElementById('camera-canvas');
  const cameraTakeButton = document.getElementById('camera-take-button');
  const cameraOutputList = document.getElementById('camera-list-output');
  const cameraListSelect = document.getElementById('camera-list-select');

  function populateTakenPicture(image) {
    // Menampilkan gambar yang diambil oleh kamera
    cameraOutputList.innerHTML = ` 
    <li><img src="${image}" alt=""></li>
  `;
  }

  // Fungsi getStream yang sudah diperbarui
  async function getStream() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: {
            exact: !streaming ? undefined : cameraListSelect.value,
          },
          aspectRatio: 16 / 9,
          width: 1280,
          height: 720,
        },
      });

      // Menampilkan daftar kamera setelah izin diberikan
      await populateCameraList();
      
      return stream;
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }

  async function populateCameraList() {
    try {
      // Get all available webcam
      const enumeratedDevices = await navigator.mediaDevices.enumerateDevices();
      const list = enumeratedDevices.filter((device) => device.kind === 'videoinput');
      cameraListSelect.innerHTML = list.reduce((accumulator, device, currentIndex) => {
        return accumulator.concat(`
          <option value="${device.deviceId}">
            ${device.label || `Camera ${currentIndex + 1}`}
          </option>
        `);
      }, '');
    } catch (error) {
      throw error;
    }
  }

  function stopCurrentStream() {
    if (!(currentStream instanceof MediaStream)) {
      return;
    }
    currentStream.getTracks().forEach((track) => {
      track.stop();
    });
  }

  function cameraLaunch(stream) {
    // Menampilkan gambar kamera yang diambil di layar
    cameraVideo.srcObject = stream;  
    cameraVideo.play(); // Memulai pemutaran video
  }

  function cameraTakePicture() {
    // Menangkap gambar dari video
    const context = cameraCanvas.getContext('2d');
    cameraCanvas.width = width;
    cameraCanvas.height = height;
    context.drawImage(cameraVideo, 0, 0, width, height); // Menggambar gambar dari video ke canvas
    return cameraCanvas.toDataURL('image/png'); // Mengembalikan gambar dalam format PNG
  }

  cameraListSelect.addEventListener('change', async () => {
    stopCurrentStream(); 
    currentStream = await getStream();
    cameraLaunch(currentStream); // Menggunakan currentStream di sini
  });

  cameraTakeButton.addEventListener('click', () => {
    const imageUrl = cameraTakePicture();
    populateTakenPicture(imageUrl);
  });

  // Menambahkan event listener untuk menghitung dimensi video saat siap diputar
  cameraVideo.addEventListener('canplay', () => {
    if (streaming) {
      return;
    }
    // Menghitung tinggi video berdasarkan lebar yang sudah ditentukan
    height = (cameraVideo.videoHeight * width) / cameraVideo.videoWidth;
    cameraVideo.setAttribute('width', width.toString());
    cameraVideo.setAttribute('height', height.toString());
    cameraCanvas.setAttribute('width', width.toString());
    cameraCanvas.setAttribute('height', height.toString());
    streaming = true; // Menandakan video sudah diputar
  });

  function populateTakenPicture(image) {
    cameraOutputList.innerHTML = `
      <li>
        <img src="${image}" alt="Captured Image" />
        <a href="${image}" download="captured-image.png">Download</a>
      </li>
    `;
  }

  async function init() {
    try {
      currentStream = await getStream();
      cameraLaunch(currentStream); // Menggunakan currentStream di sini

      currentStream.getVideoTracks().forEach((track) => {
        console.log(track.getSettings());
      });
    } catch (error) {
      console.error(error);
      alert('Error occurred: ' + error.message);
    }
  }

  init();
}

window.onload = startup;
