// DOM Elements
const fileInput = document.getElementById('image-upload');
const previewImage = document.getElementById('preview-image');
const generateButton = document.getElementById('generate-button');
const uploadSection = document.querySelector('.upload-section');
const gameContainer = document.getElementById('game-container');
const backButton = document.getElementById('back-button');
const gameCanvas = document.getElementById('game-canvas');
const uploadStatus = document.getElementById('upload-status');
const settingsToggle = document.getElementById('settings-toggle');
const settingsPanel = document.getElementById('settings-panel');
const renderDistanceSlider = document.getElementById('render-distance');
const renderDistanceValue = document.getElementById('render-distance-value');
const applySettingsButton = document.getElementById('apply-settings');
const mapsContainer = document.getElementById('maps-container');
const multiImageButton = document.getElementById('multi-image-button');
const topViewButton = document.getElementById('top-view-button');
const flySpeedSlider = document.getElementById('fly-speed');
const flySpeedValue = document.getElementById('fly-speed-value');
const superMultiImageToggle = document.getElementById('super-multi-image-toggle');
const superMultiImageCheckbox = document.getElementById('super-multi-image');
const exportObjButton = document.getElementById('export-obj-button');

// Advanced options elements
const advancedOptionsToggle = document.getElementById('advanced-options-toggle');
const advancedOptions = document.getElementById('advanced-options');
const terrainHeightSlider = document.getElementById('terrain-height');
const terrainHeightValue = document.getElementById('terrain-height-value');
const mapSizeSlider = document.getElementById('map-size');
const mapSizeValue = document.getElementById('map-size-value');

// MultiImage experiment elements
const multiImageSection = document.getElementById('multi-image-section');
const addImageButton = document.getElementById('add-image-button');
const imageSlots = document.getElementById('image-slots');
const multiImageMessage = document.getElementById('multi-image-message');
let additionalImages = [];
let multiImageMode = false;
let superMultiImageMode = false;
let maxImagesLimit = 5; // Default limit

// Warning modal
let warningShown = false;

// Websocket initialization
let room;
let currentImageData = null;
let currentImageUrl = null;
let currentImageName = null;

// Variables
let imageData = null;
let colorData = null;
let scene, camera, renderer;
let player, playerHeight = 2;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let canJump = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let collidableMeshes = [];
let clock = new THREE.Clock();
let raycaster = new THREE.Raycaster();
let terrain;
let playerOnGround = false;
let isFlying = false; 
let terrainSize = 100;
let pointerLockActive = false;
let isTopView = false;
let normalCameraPosition = new THREE.Vector3();
let normalCameraQuaternion = new THREE.Quaternion();

// Settings and advanced options
let renderDistance = 100; // Default render distance
let fogDensity = 0.01;
let isPanelVisible = false;
let heightScale = 20; // Default terrain height scale
let isAdvancedOptionsVisible = false;
let flySpeed = 8; // Default fly speed

// Toggle advanced options
if (advancedOptionsToggle && advancedOptions) {
    advancedOptionsToggle.addEventListener('click', function() {
        isAdvancedOptionsVisible = !isAdvancedOptionsVisible;
        if (isAdvancedOptionsVisible) {
            advancedOptions.classList.add('visible');
        } else {
            advancedOptions.classList.remove('visible');
        }
    });
}

// Update terrain height value display
if (terrainHeightSlider && terrainHeightValue) {
    terrainHeightSlider.addEventListener('input', function() {
        terrainHeightValue.textContent = this.value;
    });
}

// Update map size value display
if (mapSizeSlider && mapSizeValue) {
    mapSizeSlider.addEventListener('input', function() {
        mapSizeValue.textContent = this.value;
    });
}

// Update fly speed value display
if (flySpeedSlider && flySpeedValue) {
    flySpeedSlider.addEventListener('input', function() {
        flySpeedValue.textContent = this.value;
    });
}

// Initialize WebSocket connection
async function initWebSocket() {
    try {
        room = new WebsimSocket();
        
        // No longer load maps when connected
        room.onmessage = (event) => {
            const data = event.data;
            // Only handle playMap events now
            if (data.type === "playMap") {
                loadMapFromData(data.imageUrl);
            }
        };
        
        // No longer subscribe to maps collection
        // room.collection('map').subscribe(function(maps) {
        //    displayRecentMaps(maps);
        // });
    } catch (err) {
        console.error("Failed to initialize WebSocket:", err);
    }
}

// Helper function to safely escape HTML to prevent XSS
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Load recent maps - now displays removal message
function loadRecentMaps() {
    if (!mapsContainer) return;
    
    // Show the removal message instead of loading maps
    mapsContainer.innerHTML = '<div class="maps-removed-message">Recent maps has been removed due to risk of nsfw drawings.</div>';
}

// Display recent maps in the UI - now just shows removal message
function displayRecentMaps(maps) {
    if (!mapsContainer) return;
    
    // Show the removal message
    mapsContainer.innerHTML = '<div class="maps-removed-message">Recent maps has been removed due to risk of nsfw drawings.</div>';
}

// Load and display a map from URL
function loadMapFromData(imageUrl) {
    if (!imageUrl) return;
    
    // Create a new image element
    const img = new Image();
    img.crossOrigin = "Anonymous";
    
    img.onload = function() {
        // Display the image
        previewImage.src = img.src;
        previewImage.style.display = 'block';
        generateButton.disabled = false;
        uploadStatus.textContent = 'Map loaded';
        
        // Store current image
        currentImageUrl = imageUrl;
        
        // Generate the map
        generateButton.click();
    };
    
    img.onerror = function() {
        alert('Failed to load the map image. Please try another one.');
    };
    
    // Set the source to load the image
    img.src = imageUrl;
}

// Format time ago function
function getTimeAgo(date) {
    const now = new Date();
    const secondsAgo = Math.floor((now - date) / 1000);
    
    if (secondsAgo < 60) {
        return 'Just now';
    } else if (secondsAgo < 3600) {
        const minutes = Math.floor(secondsAgo / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (secondsAgo < 86400) {
        const hours = Math.floor(secondsAgo / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        const days = Math.floor(secondsAgo / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
}

// Save the generated map to the collection - now disabled
async function saveMap(imageUrl) {
    // Maps are no longer saved to database
    console.log("Map saving disabled");
    return;
}

// Toggle settings panel
if (settingsToggle) {
    settingsToggle.addEventListener('click', function() {
        isPanelVisible = !isPanelVisible;
        settingsPanel.classList.toggle('visible', isPanelVisible);
    });
}

// Update render distance display
if (renderDistanceSlider) {
    renderDistanceSlider.addEventListener('input', function() {
        renderDistanceValue.textContent = this.value;
    });
}

// Apply settings
if (applySettingsButton) {
    applySettingsButton.addEventListener('click', function() {
        renderDistance = parseInt(renderDistanceSlider.value);
        flySpeed = parseInt(flySpeedSlider.value);
        if (scene && scene.fog) {
            scene.fog.far = renderDistance;
        }
        isPanelVisible = false;
        settingsPanel.classList.remove('visible');
    });
}

// Image upload preview
fileInput.addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (file) {
        try {
            const reader = new FileReader();
            reader.onload = function(event) {
                if (multiImageMode && additionalImages.length < maxImagesLimit) {
                    // In multi-image mode, add to the collection
                    additionalImages.push({
                        data: event.target.result,
                        name: file.name
                    });
                    
                    // Update the image slots display
                    updateImageSlots();
                    
                    // Clear the file input for the next selection
                    fileInput.value = "";
                    
                    // Update the message
                    updateMultiImageMessage();
                } else {
                    // Standard single image mode
                    previewImage.src = event.target.result;
                    previewImage.style.display = 'block';
                    generateButton.disabled = false;
                    uploadStatus.textContent = file.name;
                    currentImageData = event.target.result;
                    // Store the filename to use as the map title
                    currentImageName = file.name;
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error processing file:', error);
            alert('Error processing file. Please try again with a different image.');
        }
    } else {
        previewImage.style.display = 'none';
        generateButton.disabled = true;
        uploadStatus.textContent = 'No file selected';
    }
});

// Update the image slots display
function updateImageSlots() {
    imageSlots.innerHTML = '';
    
    // Create elements for each image
    additionalImages.forEach((img, index) => {
        const slot = document.createElement('div');
        slot.className = 'image-slot';
        
        const imgElement = document.createElement('img');
        imgElement.src = img.data;
        imgElement.alt = `Image ${index + 2}`;
        
        const removeButton = document.createElement('button');
        removeButton.className = 'remove-image-button';
        removeButton.innerHTML = '&times;';
        removeButton.onclick = () => removeImage(index);
        
        const label = document.createElement('div');
        label.className = 'slot-label';
        label.textContent = `Image ${index + 2}: ${escapeHtml(img.name)}`;
        
        slot.appendChild(imgElement);
        slot.appendChild(removeButton);
        slot.appendChild(label);
        
        imageSlots.appendChild(slot);
    });
}

// Remove an image from the collection
function removeImage(index) {
    additionalImages.splice(index, 1);
    updateImageSlots();
    updateMultiImageMessage();
}

// Update the multi-image message
function updateMultiImageMessage() {
    if (additionalImages.length === 0) {
        multiImageMessage.textContent = 'Click "Choose Image" to add your first image';
        generateButton.disabled = true;
    } else if (additionalImages.length === 1) {
        multiImageMessage.textContent = `Added 1 image. You can add ${maxImagesLimit - 1} more images`;
        // Enable generate button with at least 1 image
        generateButton.disabled = false;
    } else if (additionalImages.length < maxImagesLimit) {
        multiImageMessage.textContent = `Added ${additionalImages.length} images. You can add ${maxImagesLimit - additionalImages.length} more images`;
        generateButton.disabled = false;
    } else {
        multiImageMessage.textContent = 'Maximum number of additional images reached';
        generateButton.disabled = false;
    }
}

// Toggle multi-image mode
function toggleMultiImageMode() {
    multiImageMode = !multiImageMode;
    
    if (multiImageMode) {
        // Show the multi-image section
        multiImageSection.style.display = 'block';
        // Reset the collection
        additionalImages = [];
        // Hide the preview image
        previewImage.style.display = 'none';
        // Disable the generate button until we have at least one additional image
        generateButton.disabled = true;
        // Reset the upload status
        uploadStatus.textContent = 'Select images to combine';
        // Reset the current image data
        currentImageData = null;
        currentImageName = null;
        
        // Initialize the message
        updateMultiImageMessage();
    } else {
        // Hide the multi-image section
        multiImageSection.style.display = 'none';
        // Clear the image slots
        imageSlots.innerHTML = '';
        // Reset the collection
        additionalImages = [];
        // Reset the upload status
        uploadStatus.textContent = 'No file selected';
        // Disable the generate button
        generateButton.disabled = true;
        // Reset Super MultiImage mode
        superMultiImageMode = false;
        if (superMultiImageCheckbox) {
            superMultiImageCheckbox.checked = false;
        }
        maxImagesLimit = 5; // Reset to default
    }
}

// Toggle multi-image mode when button is clicked
if (multiImageButton) {
    multiImageButton.addEventListener('click', function() {
        toggleMultiImageMode();
    });
}

// Toggle Super MultiImage mode
if (superMultiImageCheckbox) {
    superMultiImageCheckbox.addEventListener('change', function() {
        superMultiImageMode = this.checked;
        maxImagesLimit = superMultiImageMode ? 256 : 5;
        
        // Update message to reflect new limit
        updateMultiImageMessage();
        
        // Show warning if enabling super mode
        if (superMultiImageMode) {
            alert('Warning: Adding many images may cause lag or crashes on lower-end devices.');
        }
    });
}

// Generate 3D map button
generateButton.addEventListener('click', async function() {
    // Check if we need to show the warning
    if (!localStorage.getItem('warningDismissed') && !warningShown) {
        showWarningModal();
        return;
    }
    
    // Get advanced options values if they exist
    if (terrainHeightSlider) {
        heightScale = parseInt(terrainHeightSlider.value);
    }
    
    if (mapSizeSlider) {
        terrainSize = parseInt(mapSizeSlider.value);
    }
    
    if (multiImageMode && additionalImages.length > 0) {
        // Process multiple images
        processMultipleImagesForHeightMap();
    } else {
        // Process the single image to get height data
        processImageForHeightMap();
    }
    
    // Hide upload section and show game
    uploadSection.style.display = 'none';
    gameContainer.style.display = 'block';
    
    // Initialize 3D environment
    initThreeJS();
    
    // Create 3D world from height data
    createWorld();
    
    // Start animation loop
    animate();
    
    // If this is a new upload (not loaded from existing maps)
    if ((currentImageData && !currentImageUrl) || (multiImageMode && additionalImages.length > 0)) {
        try {
            // For multi-image, we'll use the first image for the preview
            let imageToUpload = currentImageData;
            let filename = currentImageName || "terrain.png";
            
            if (multiImageMode && additionalImages.length > 0) {
                // Use the first additional image as preview when in multi-image mode
                imageToUpload = additionalImages[0].data;
                filename = additionalImages[0].name || "multi_terrain.png";
            }
            
            // Upload image to get a permanent URL
            const blob = dataURItoBlob(imageToUpload);
            const file = new File([blob], filename, { type: "image/png" });
            const imageUrl = await websim.upload(file);
            
            // Save to the map collection
            if (imageUrl) {
                currentImageUrl = imageUrl;
                saveMap(imageUrl);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    }
});

// Show the warning modal
function showWarningModal() {
    warningShown = true;
    
    // Create modal elements
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'warning-modal-overlay';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'warning-modal';
    
    modalContent.innerHTML = `
        <h3>⚠️ Warning</h3>
        <p>Nothing generated is private. DO NOT submit any personal images, like pictures of yourself or other people.</p>
        <div class="warning-modal-buttons">
            <button class="warning-modal-button warning-dont-show-button" id="dont-show-again">Don't Show Again</button>
            <button class="warning-modal-button warning-ok-button" id="warning-ok">OK</button>
        </div>
    `;
    
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    // Handle button clicks
    document.getElementById('warning-ok').addEventListener('click', function() {
        document.body.removeChild(modalOverlay);
        // Proceed with generation
        generateButton.click();
    });
    
    document.getElementById('dont-show-again').addEventListener('click', function() {
        // Save preference to localStorage
        localStorage.setItem('warningDismissed', 'true');
        document.body.removeChild(modalOverlay);
        // Proceed with generation
        generateButton.click();
    });
}

// Process multiple images to create a combined height map
function processMultipleImagesForHeightMap() {
    // Start with the main image if present
    let imagesToProcess = [];
    
    if (currentImageData) {
        imagesToProcess.push({
            data: currentImageData,
            name: currentImageName
        });
    }
    
    // Add the additional images
    imagesToProcess = imagesToProcess.concat(additionalImages);
    
    // Need at least one image
    if (imagesToProcess.length === 0) {
        console.error("No images to process");
        return;
    }
    
    // Create temporary images to get dimensions
    const tempImages = [];
    let totalWidth = 0;
    let maxHeight = 0;
    
    // Create Image objects to get dimensions
    imagesToProcess.forEach(imgData => {
        const img = new Image();
        img.src = imgData.data;
        tempImages.push(img);
        
        // Update total width and max height
        totalWidth += img.width;
        maxHeight = Math.max(maxHeight, img.height);
    });
    
    // Create a canvas to combine the images
    const canvas = document.createElement('canvas');
    canvas.width = totalWidth;
    canvas.height = maxHeight;
    const ctx = canvas.getContext('2d');
    
    // Draw images side by side
    let currentX = 0;
    tempImages.forEach(img => {
        ctx.drawImage(img, currentX, 0);
        currentX += img.width;
    });
    
    // Get the combined image data
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Create a height map array based on pixel brightness
    imageData = {
        width: canvas.width,
        height: canvas.height,
        data: new Float32Array(canvas.width * canvas.height)
    };
    
    // Create a color map array to store RGB values
    colorData = {
        width: canvas.width,
        height: canvas.height,
        data: new Uint8Array(canvas.width * canvas.height * 3)
    };
    
    for (let i = 0; i < canvas.height; i++) {
        for (let j = 0; j < canvas.width; j++) {
            const index = (i * canvas.width + j);
            const pixelIndex = index * 4; 
            
            // Calculate brightness with weighted RGB for better perception
            const r = imgData.data[pixelIndex];
            const g = imgData.data[pixelIndex + 1];
            const b = imgData.data[pixelIndex + 2];
            
            // Use perceptual luminance formula for better height accuracy
            const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            
            // Store in our height map data
            imageData.data[index] = brightness;
            
            // Store color data (RGB)
            const colorIndex = index * 3;
            colorData.data[colorIndex] = r;
            colorData.data[colorIndex + 1] = g;
            colorData.data[colorIndex + 2] = b;
        }
    }
    
    // Create a combined name for the map
    if (imagesToProcess.length > 1) {
        currentImageName = `Multi-Image Map (${imagesToProcess.length} images)`;
    } else {
        currentImageName = "Multi-Image Map";
    }
}

// Convert data URI to Blob
function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([ab], { type: mimeString });
}

// Back button to return to upload
backButton.addEventListener('click', function() {
    gameContainer.style.display = 'none';
    uploadSection.style.display = 'block';
    
    // Exit pointer lock if active
    if (document.pointerLockElement === renderer.domElement) {
        document.exitPointerLock();
    }
    pointerLockActive = false;
    
    // Clean up Three.js scene
    if (renderer) {
        renderer.dispose();
        scene = null;
        camera = null;
        collidableMeshes = [];
    }
    
    // Reload recent maps
    loadRecentMaps();
    
    // Reset multi-image mode when going back
    multiImageMode = false;
    multiImageSection.style.display = 'none';
    additionalImages = [];
});

// Process image to extract height data
function processImageForHeightMap() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions to match the image
    canvas.width = previewImage.naturalWidth;
    canvas.height = previewImage.naturalHeight;
    
    // Draw the image on the canvas
    ctx.drawImage(previewImage, 0, 0);
    
    // Get image data (RGBA values for each pixel)
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Create a height map array based on pixel brightness
    imageData = {
        width: canvas.width,
        height: canvas.height,
        data: new Float32Array(canvas.width * canvas.height)
    };
    
    // Create a color map array to store RGB values
    colorData = {
        width: canvas.width,
        height: canvas.height,
        data: new Uint8Array(canvas.width * canvas.height * 3) 
    };
    
    for (let i = 0; i < canvas.height; i++) {
        for (let j = 0; j < canvas.width; j++) {
            const index = (i * canvas.width + j);
            const pixelIndex = index * 4; 
            
            // Calculate brightness with weighted RGB for better perception
            const r = imgData.data[pixelIndex];
            const g = imgData.data[pixelIndex + 1];
            const b = imgData.data[pixelIndex + 2];
            
            // Use perceptual luminance formula for better height accuracy
            const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            
            // Store in our height map data
            imageData.data[index] = brightness;
            
            // Store color data (RGB)
            const colorIndex = index * 3;
            colorData.data[colorIndex] = r;
            colorData.data[colorIndex + 1] = g;
            colorData.data[colorIndex + 2] = b;
        }
    }
}

// Initialize Three.js scene
function initThreeJS() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); 
    
    // Add fog for atmosphere - using the current render distance
    scene.fog = new THREE.Fog(0x87ceeb, 10, renderDistance);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, gameCanvas.clientWidth / gameCanvas.clientHeight, 0.1, 1000);
    camera.position.y = playerHeight;
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(gameCanvas.clientWidth, gameCanvas.clientHeight);
    renderer.shadowMap.enabled = true;
    gameCanvas.innerHTML = '';
    gameCanvas.appendChild(renderer.domElement);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x606060);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 200, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.far = 300;
    scene.add(directionalLight);
    
    // Set up pointer lock controls
    setupPointerLock();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
    
    // Set up keyboard controls
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
    
    // Load required libraries dynamically
    loadExportLibraries();
}

// Load the OBJ exporter library
function loadExportLibraries() {
    // Check if we already have the library loaded
    if (window.THREE && !THREE.OBJExporter) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/three@0.137.0/examples/js/exporters/OBJExporter.js';
        script.onload = function() {
            console.log('OBJ Exporter loaded successfully');
        };
        script.onerror = function() {
            console.error('Failed to load OBJ Exporter');
        };
        document.head.appendChild(script);
    }
}

// Set up pointer lock
function setupPointerLock() {
    // Request pointer lock when clicking on the renderer
    renderer.domElement.addEventListener('click', function() {
        if (!pointerLockActive) {
            renderer.domElement.requestPointerLock();
        }
    });
    
    // Handle pointer lock change
    document.addEventListener('pointerlockchange', pointerLockChangeHandler, false);
    document.addEventListener('mozpointerlockchange', pointerLockChangeHandler, false);
    document.addEventListener('webkitpointerlockchange', pointerLockChangeHandler, false);
    
    // Handle pointer lock error
    document.addEventListener('pointerlockerror', pointerLockErrorHandler, false);
    document.addEventListener('mozpointerlockerror', pointerLockErrorHandler, false);
    document.addEventListener('webkitpointerlockerror', pointerLockErrorHandler, false);
}

// Pointer lock change handler
function pointerLockChangeHandler() {
    if (document.pointerLockElement === renderer.domElement || 
        document.mozPointerLockElement === renderer.domElement || 
        document.webkitPointerLockElement === renderer.domElement) {
        // Pointer locked
        pointerLockActive = true;
        document.addEventListener('mousemove', onMouseMove, false);
    } else {
        // Pointer unlocked
        pointerLockActive = false;
        document.removeEventListener('mousemove', onMouseMove, false);
    }
}

// Pointer lock error handler
function pointerLockErrorHandler(event) {
    console.warn('Pointer lock error:', event);
}

// Create 3D world based on the height map
function createWorld() {
    // Using the heightScale from advanced options
    
    // Create higher resolution terrain for better fidelity
    const segmentsX = Math.min(Math.max(imageData.width / 2, 64), 256); 
    const segmentsZ = Math.min(Math.max(imageData.height / 2, 64), 256);
    
    // Create terrain geometry
    const geometry = new THREE.PlaneGeometry(
        terrainSize, 
        terrainSize * (imageData.height / imageData.width), 
        segmentsX - 1, 
        segmentsZ - 1
    );
    
    // Rotate to be horizontal
    geometry.rotateX(-Math.PI / 2);
    
    // Apply height map to vertices and create color attribute
    const vertices = geometry.attributes.position.array;
    
    // Create color attribute for the geometry
    const colors = new Float32Array(vertices.length);
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    for (let i = 0; i < vertices.length; i += 3) {
        // Find the corresponding height map pixel
        const x = Math.floor(((vertices[i] / terrainSize) + 0.5) * imageData.width);
        const z = Math.floor(((vertices[i + 2] / (terrainSize * (imageData.height / imageData.width))) + 0.5) * imageData.height);
        
        // Clamp to valid indices
        const pixelX = THREE.MathUtils.clamp(x, 0, imageData.width - 1);
        const pixelZ = THREE.MathUtils.clamp(z, 0, imageData.height - 1);
        
        // Get the height value and apply it to the vertex
        const heightValue = getHeightAt(pixelX, pixelZ);
        vertices[i + 1] = heightValue * heightScale;
        
        // Get color from the color data
        const colorIndex = (pixelZ * imageData.width + pixelX) * 3;
        const colorOffset = i; 
        colors[colorOffset]     = colorData.data[colorIndex] / 255;     
        colors[colorOffset + 1] = colorData.data[colorIndex + 1] / 255; 
        colors[colorOffset + 2] = colorData.data[colorIndex + 2] / 255; 
    }
    
    geometry.computeVertexNormals();
    
    // Create terrain material with vertex colors
    const material = new THREE.MeshPhongMaterial({
        vertexColors: true,
        flatShading: true,
        shininess: 0,
        wireframe: false
    });
    
    // Create terrain mesh
    terrain = new THREE.Mesh(geometry, material);
    terrain.receiveShadow = true;
    terrain.castShadow = true;
    scene.add(terrain);
    
    // Add terrain to collidable objects
    collidableMeshes.push(terrain);
    
    // Create player with cylinder geometry but make it invisible
    const playerGeometry = new THREE.CylinderGeometry(0.5, 0.5, playerHeight, 8);
    playerGeometry.translate(0, playerHeight/2, 0); 
    
    // Make the player invisible by using a transparent material
    const playerMaterial = new THREE.MeshBasicMaterial({ 
        transparent: true, 
        opacity: 0.0 
    });
    
    player = new THREE.Mesh(playerGeometry, playerMaterial);
    
    // Find a suitable starting point (highest point near center)
    const centerX = Math.floor(imageData.width / 2);
    const centerZ = Math.floor(imageData.height / 2);
    const searchRadius = Math.min(20, Math.min(centerX, centerZ));
    
    let highestPoint = 0;
    let startX = centerX;
    let startZ = centerZ;
    
    // Search for highest point near center
    for (let z = centerZ - searchRadius; z <= centerZ + searchRadius; z++) {
        for (let x = centerX - searchRadius; x <= centerX + searchRadius; x++) {
            if (x >= 0 && x < imageData.width && z >= 0 && z < imageData.height) {
                const heightValue = getHeightAt(x, z);
                if (heightValue > highestPoint) {
                    highestPoint = heightValue;
                    startX = x;
                    startZ = z;
                }
            }
        }
    }
    
    // Convert image coordinates to 3D world coordinates
    const worldX = ((startX / imageData.width) - 0.5) * terrainSize;
    const worldZ = ((startZ / imageData.height) - 0.5) * terrainSize * (imageData.height / imageData.width);
    const worldY = highestPoint * heightScale + 2; 
    
    player.position.set(worldX, worldY, worldZ);
    scene.add(player);
    
    // Position camera at player position
    camera.position.copy(player.position);
}

// Get height value at specific coordinates
function getHeightAt(x, z) {
    // Ensure we're within bounds
    if (x < 0 || x >= imageData.width || z < 0 || z >= imageData.height) {
        return 0;
    }
    
    const index = z * imageData.width + x;
    return imageData.data[index];
}

// Get interpolated height at any world position
function getTerrainHeightAtPosition(x, z) {
    if (!terrain || !imageData) return 0;
    
    // Use heightScale from advanced options 
    
    // Convert world coordinates to image coordinates
    const imgX = Math.floor(((x / terrainSize) + 0.5) * imageData.width);
    const imgZ = Math.floor(((z / (terrainSize * (imageData.height / imageData.width))) + 0.5) * imageData.height);
    
    // Ensure we're within bounds
    if (imgX < 0 || imgX >= imageData.width - 1 || imgZ < 0 || imgZ >= imageData.height - 1) {
        return 0;
    }
    
    // Get surrounding 4 points for bilinear interpolation
    const h00 = getHeightAt(imgX, imgZ) * heightScale;
    const h10 = getHeightAt(imgX + 1, imgZ) * heightScale;
    const h01 = getHeightAt(imgX, imgZ + 1) * heightScale;
    const h11 = getHeightAt(imgX + 1, imgZ + 1) * heightScale;
    
    // Calculate fractional parts
    const fracX = ((x / terrainSize) + 0.5) * imageData.width - imgX;
    const fracZ = ((z / (terrainSize * (imageData.height / imageData.width))) + 0.5) * imageData.height - imgZ;
    
    // Bilinear interpolation
    const top = h00 * (1 - fracX) + h10 * fracX;
    const bottom = h01 * (1 - fracX) + h11 * fracX;
    
    return top * (1 - fracZ) + bottom * fracZ;
}

// Handle window resize
function onWindowResize() {
    camera.aspect = gameCanvas.clientWidth / gameCanvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(gameCanvas.clientWidth, gameCanvas.clientHeight);
}

// Keyboard controls
function onKeyDown(event) {
    switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
            moveForward = true;
            break;
        case 'KeyA':
        case 'ArrowLeft':
            moveLeft = true;
            break;
        case 'KeyS':
        case 'ArrowDown':
            moveBackward = true;
            break;
        case 'KeyD':
        case 'ArrowRight':
            moveRight = true;
            break;
        case 'Space':
            if (canJump || isFlying) {
                velocity.y = 10;
                if (!isFlying) canJump = false;
            }
            break;
        case 'KeyF': 
            isFlying = !isFlying;
            velocity.y = 0; 
            break;
    }
}

function onKeyUp(event) {
    switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
            moveForward = false;
            break;
        case 'KeyA':
        case 'ArrowLeft':
            moveLeft = false;
            break;
        case 'KeyS':
        case 'ArrowDown':
            moveBackward = false;
            break;
        case 'KeyD':
        case 'ArrowRight':
            moveRight = false;
            break;
    }
}

// Mouse movement for camera rotation
function onMouseMove(event) {
    if (pointerLockActive) {
        try {
            // Update camera rotation based on mouse movement
            const movementX = event.movementX || 0;
            const movementY = event.movementY || 0;
            
            // Create a quaternion for horizontal rotation
            const rotationQuaternion = new THREE.Quaternion();
            rotationQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -movementX * 0.002);
            
            // Apply the quaternion to the camera's direction
            camera.quaternion.premultiply(rotationQuaternion);
            
            // Create and apply vertical rotation (with limits)
            const vertAxis = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
            const vertRotation = -movementY * 0.002;
            
            // Apply vertical rotation without checking limits in fly mode
            const vertQuaternion = new THREE.Quaternion();
            vertQuaternion.setFromAxisAngle(vertAxis, vertRotation);
            camera.quaternion.premultiply(vertQuaternion);
            
            // Only check pitch limits when not in flying mode
            if (!isFlying) {
                // Check if we've exceeded pitch limits
                const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
                const pitch = Math.asin(forward.y);
                
                // If we've exceeded limits, revert to old quaternion
                if (pitch > Math.PI/3 || pitch < -Math.PI/3) {
                    // Store old quaternion before applying vertical rotation
                    const oldQuaternion = camera.quaternion.clone();
                    camera.quaternion.copy(oldQuaternion);
                }
            }
        } catch (error) {
            console.warn('Error in mouse move handler:', error);
        }
    }
}

// Check for ground collision
function checkGroundCollision() {
    const raycaster = new THREE.Raycaster();
    const rayDirection = new THREE.Vector3(0, -1, 0);
    
    raycaster.set(player.position.clone().add(new THREE.Vector3(0, 0.1, 0)), rayDirection);
    const intersects = raycaster.intersectObjects(collidableMeshes);
    
    if (intersects.length > 0 && intersects[0].distance < 1.0) {
        playerOnGround = true;
        canJump = true;
        velocity.y = Math.max(0, velocity.y);
        player.position.y = intersects[0].point.y + (playerHeight/2);
        return true;
    }
    
    playerOnGround = false;
    return false;
}

// Check if player is below terrain or out of bounds
function checkOutOfBounds() {
    let minHeight = -10; 
    
    if (player.position.y < minHeight) {
        let teleportX = player.position.x;
        let teleportZ = player.position.z;
        let teleportY = 0;
        
        const terrainHeight = getTerrainHeightAtPosition(teleportX, teleportZ);
        teleportY = terrainHeight + 5; 
        
        if (teleportY < minHeight) {
            teleportX = 0;
            teleportZ = 0;
            teleportY = 20;
        }
        
        player.position.set(teleportX, teleportY, teleportZ);
        velocity.set(0, 0, 0); 
    }
}

// Top view button functionality
if (topViewButton) {
    topViewButton.addEventListener('click', function() {
        toggleTopView();
    });
}

// Toggle top view function
function toggleTopView() {
    isTopView = !isTopView;
    
    if (isTopView) {
        // Store current camera position and rotation
        normalCameraPosition.copy(camera.position);
        normalCameraQuaternion.copy(camera.quaternion);
        
        // Exit pointer lock if active
        if (document.pointerLockElement === renderer.domElement) {
            document.exitPointerLock();
        }
        pointerLockActive = false;
        
        // Move camera to top view position
        const height = Math.max(terrainSize, terrainSize * (imageData.height / imageData.width)) * 0.8;
        camera.position.set(0, height, 0);
        camera.quaternion.setFromEuler(new THREE.Euler(-Math.PI/2, 0, 0));
        
        // Update button text
        topViewButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12 7l-8 9h16l-8-9zm0 2l5.5 6h-11l5.5-6z"/>
            </svg>
            First Person`;
    } else {
        // Restore camera position and rotation
        camera.position.copy(normalCameraPosition);
        camera.quaternion.copy(normalCameraQuaternion);
        
        // Update button text
        topViewButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12 19l-8-9h16l-8 9zm0-2l5.5-6h-11l5.5 6z"/>
            </svg>
            Top View`;
    }
}

// Animation loop
function animate() {
    if (!scene) return;
    
    requestAnimationFrame(animate);
    
    const delta = Math.min(clock.getDelta(), 0.1); 
    const moveSpeed = 8; 
    
    // Handle movement only when not in top view
    if (!isTopView) {
        // Reset movement direction
        direction.set(0, 0, 0);
        
        // Get camera's forward and right vectors (horizontal only)
        const cameraDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        cameraDirection.y = 0;
        cameraDirection.normalize();
        
        const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
        cameraRight.y = 0;
        cameraRight.normalize();
        
        // Calculate movement vector based on keys pressed
        const movementVector = new THREE.Vector3(0, 0, 0);
        
        if (moveForward) {
            movementVector.add(cameraDirection);
        }
        if (moveBackward) {
            movementVector.sub(cameraDirection);
        }
        if (moveLeft) {
            movementVector.sub(cameraRight);
        }
        if (moveRight) {
            movementVector.add(cameraRight);
        }
        
        // Normalize if moving in multiple directions
        if (movementVector.length() > 0) {
            movementVector.normalize();
        }
        
        // Apply movement speed - use flySpeed when flying
        const currentSpeed = isFlying ? flySpeed : moveSpeed;
        velocity.x = movementVector.x * currentSpeed;
        velocity.z = movementVector.z * currentSpeed;
        
        // Fix flight mode - actually enable true flight
        if (!isFlying && !playerOnGround) {
            // Normal gravity when not flying and not on ground
            velocity.y -= 20 * delta;
        } else if (isFlying) {
            // In flight mode - no gravity, just gradual deceleration
            velocity.y *= 0.95;
            
            // Add vertical movement in flight mode
            if (moveForward && cameraDirection.y !== 0) {
                // Add some vertical component based on camera angle
                velocity.y += cameraDirection.y * flySpeed * delta * 2;
            }
        }
        
        // Apply velocity to position
        player.position.x += velocity.x * delta;
        player.position.z += velocity.z * delta;
        player.position.y += velocity.y * delta;
        
        if (!isFlying) {
            checkGroundCollision();
        }
        
        checkOutOfBounds();
        
        const halfSizeX = terrainSize / 2;
        const halfSizeZ = (terrainSize * (imageData.height / imageData.width)) / 2;
        
        player.position.x = THREE.MathUtils.clamp(player.position.x, -halfSizeX + 1, halfSizeX - 1);
        player.position.z = THREE.MathUtils.clamp(player.position.z, -halfSizeZ + 1, halfSizeZ - 1);
        
        // Update camera position to follow player when not in top view
        camera.position.copy(player.position);
        // Store updated position for returning from top view
        normalCameraPosition.copy(camera.position);
        normalCameraQuaternion.copy(camera.quaternion);
    }
    
    renderer.render(scene, camera);
}

// Export the terrain mesh as OBJ
function exportTerrainAsOBJ() {
    if (!terrain) {
        alert('No terrain to export. Please generate a map first.');
        return;
    }
    
    try {
        // Require the OBJExporter
        if (!THREE.OBJExporter) {
            alert('OBJ Exporter not available. Please try again later.');
            return;
        }
        
        // Create a new instance of the exporter
        const exporter = new THREE.OBJExporter();
        
        // Parse the terrain mesh into an OBJ string
        const result = exporter.parse(terrain);
        
        // Create a blob with the OBJ data
        const blob = new Blob([result], { type: 'text/plain' });
        
        // Create a URL for the blob
        const url = URL.createObjectURL(blob);
        
        // Create a download link
        const link = document.createElement('a');
        link.href = url;
        
        // Set a default filename based on the current image name or a timestamp
        let filename = 'terrain';
        if (currentImageName) {
            // Remove file extension if present
            filename = currentImageName.replace(/\.[^/.]+$/, "");
        }
        link.download = `${filename}_terrain.obj`;
        
        // Append the link, click it, and remove it
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Release the URL object
        URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error('Error exporting OBJ:', error);
        alert('Failed to export terrain. Please try again later.');
    }
}

// Add event listener to the export OBJ button
if (exportObjButton) {
    exportObjButton.addEventListener('click', exportTerrainAsOBJ);
}

// Initialize websocket when page loads
window.addEventListener('DOMContentLoaded', initWebSocket);