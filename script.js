let selectedMood = null;

// DOM elements
const generateBtn = document.getElementById('generateBtn');
const motivationDisplay = document.getElementById('motivationDisplay');
const motivationText = document.getElementById('motivationText');
const authorText = document.getElementById('authorText');
const errorMessage = document.getElementById('errorMessage');
const fallbackNotice = document.getElementById('fallbackNotice');
const btnText = document.querySelector('.btn-text');
const loadingText = document.querySelector('.loading');

// Mood selection
document.querySelectorAll('.mood-card').forEach(card => {
    card.addEventListener('click', () => {
        // Remove selected class from all cards
        document.querySelectorAll('.mood-card').forEach(c => c.classList.remove('selected-mood'));
        
        // Add selected class to clicked card
        card.classList.add('selected-mood');
        
        // Store selected mood
        selectedMood = card.dataset.mood;
        
        // Enable generate button
        generateBtn.disabled = false;
        
        // Hide previous results
        hideAllMessages();
    });
});

// Generate motivation
generateBtn.addEventListener('click', async () => {
    if (!selectedMood) return;
    
    // Show loading state
    setLoadingState(true);
    hideAllMessages();
    
    try {
        const response = await fetch('/generate-motivation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mood: selectedMood })
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayMotivation(data.motivation, data.fallback);
        } else {
            showError(data.error || 'Something went wrong. Please try again.');
        }
        
    } catch (error) {
        console.error('Error:', error);
        showError('Network error. Please check your connection and try again.');
    } finally {
        setLoadingState(false);
    }
});

function setLoadingState(loading) {
    if (loading) {
        generateBtn.classList.add('loading');
        generateBtn.disabled = true;
        btnText.style.display = 'none';
        loadingText.style.display = 'inline';
    } else {
        generateBtn.classList.remove('loading');
        generateBtn.disabled = false;
        btnText.style.display = 'inline';
        loadingText.style.display = 'none';
    }
}

function displayMotivation(motivation, isFallback = false) {
    // Hide display first for smooth transition
    motivationDisplay.classList.remove('show');
    
    setTimeout(() => {
        if (motivation.type === 'quote') {
            motivationText.innerHTML = `"${motivation.text}"`;
            authorText.textContent = `— ${motivation.author}`;
            authorText.style.display = 'block';
        } else {
            motivationText.innerHTML = motivation.text;
            authorText.style.display = 'none';
        }
        
        // Show fallback notice if applicable
        if (isFallback) {
            fallbackNotice.style.display = 'block';
        } else {
            fallbackNotice.style.display = 'none';
        }
        
        // Show display with animation
        motivationDisplay.classList.add('show');
    }, 250);
}

function showError(message) {
    errorMessage.querySelector('p').textContent = message;
    errorMessage.classList.add('show');
}

function hideAllMessages() {
    motivationDisplay.classList.remove('show');
    errorMessage.classList.remove('show');
}

// Add visual feedback on button press
generateBtn.addEventListener('mousedown', function() {
    if (!this.disabled) {
        this.style.transform = 'translateY(0px)';
    }
});

generateBtn.addEventListener('mouseup', function() {
    if (!this.disabled) {
        this.style.transform = 'translateY(-2px)';
    }
});

// Add keyboard support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && selectedMood && !generateBtn.disabled) {
        generateBtn.click();
    }
});

// Add mood card keyboard navigation
document.querySelectorAll('.mood-card').forEach((card, index) => {
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
        }
    });
});