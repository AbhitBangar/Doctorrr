// Track hover counts and shift counts for each button
const buttonHoverCounts = new Map();
const buttonShiftCounts = new Map();

// Initialize floating hearts and medical symbols
function createFloatingHearts() {
    const heartBg = document.getElementById('heartBg');
    const hearts = ['❤️', '💕', '💖', '💗', '💓', '💝', '💞'];
    const medical = ['⚕️', '🩺', '💊', '💉', '🏥', '🔬', '⚗️'];
    
    // Add hearts
    for (let i = 0; i < 15; i++) {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDelay = Math.random() * 15 + 's';
        heart.style.fontSize = (Math.random() * 20 + 15) + 'px';
        heartBg.appendChild(heart);
    }
    
    // Add medical symbols
    for (let i = 0; i < 10; i++) {
        const symbol = document.createElement('div');
        symbol.className = 'medical-symbol';
        symbol.textContent = medical[Math.floor(Math.random() * medical.length)];
        symbol.style.left = Math.random() * 100 + '%';
        symbol.style.animationDelay = Math.random() * 20 + 's';
        symbol.style.fontSize = (Math.random() * 15 + 12) + 'px';
        heartBg.appendChild(symbol);
    }
}

// Navigation progress dots
function updateProgress() {
    const totalPages = 10;
    const navProgress = document.getElementById('navProgress');
    navProgress.innerHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
        const dot = document.createElement('div');
        dot.className = 'nav-dot';
        navProgress.appendChild(dot);
    }
}

// Go to page function
function goToPage(pageNum) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    const targetPage = pageNum === 'final' ? 
        document.getElementById('pageFinal') : 
        document.getElementById('page' + pageNum);
    
    targetPage.classList.add('active');
    
    // Update progress dots
    const dots = document.querySelectorAll('.nav-dot');
    dots.forEach((dot, index) => {
        if (index < (pageNum === 'final' ? 10 : pageNum - 1)) {
            dot.classList.add('active');
        }
    });

    // Add confetti for final page
    if (pageNum === 'final') {
        createConfetti();
    }

    // Scroll to top
    window.scrollTo(0, 0);
}

// Handle "No" button hover - moves the button away
function handleNoHover(btn) {
    // Get the button's unique ID
    const buttonId = btn.getAttribute('data-page');
    
    // Initialize hover count
    if (!buttonHoverCounts.has(buttonId)) {
        buttonHoverCounts.set(buttonId, 0);
    }
    
    // Initialize shift count
    if (!buttonShiftCounts.has(buttonId)) {
        buttonShiftCounts.set(buttonId, 0);
    }
    
    // Get current shift count
    const currentShifts = buttonShiftCounts.get(buttonId);
    
    // Determine required shifts based on page
    let requiredShifts = 3;
    if (buttonId === '6') requiredShifts = 4;
    if (buttonId === '7') requiredShifts = 3;
    if (buttonId === '8') requiredShifts = 3;
    if (buttonId === '9') requiredShifts = 3;
    
    // Only move if we haven't reached required shifts yet
    if (currentShifts < requiredShifts) {
        // Increment hover count
        const currentCount = buttonHoverCounts.get(buttonId);
        buttonHoverCounts.set(buttonId, currentCount + 1);
        
        // Move the button and increment shift count
        moveButtonAway(btn, buttonId);
        buttonShiftCounts.set(buttonId, currentShifts + 1);
        
        // Check if this was the final shift
        if (currentShifts + 1 >= requiredShifts) {
            // Add a visual indicator that button is now clickable
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        }
    } else {
        // Button has shifted enough times - make it clearly clickable
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
        // Subtle pulse to show it's clickable
        btn.style.animation = 'pulse 1s infinite';
    }
}

// Move button to random position using absolute positioning
function moveButtonAway(btn, buttonId) {
    // Add moving class to prevent clicks while moving
    btn.classList.add('moving');
    
    // On first move, switch to absolute positioning
    if (!btn.classList.contains('has-moved')) {
        btn.classList.add('has-moved');
    }
    
    // Get container boundaries
    const container = btn.closest('.button-container');
    const containerRect = container.getBoundingClientRect();
    const btnWidth = btn.offsetWidth;
    const btnHeight = btn.offsetHeight;
    
    // Get Yes button position
    const yesBtn = container.querySelector('.btn-yes');
    if (!yesBtn) {
        btn.classList.remove('moving');
        return;
    }
    
    const yesBtnRect = yesBtn.getBoundingClientRect();
    const yesCenterX = yesBtnRect.left - containerRect.left + yesBtnRect.width / 2;
    const yesCenterY = yesBtnRect.top - containerRect.top + yesBtnRect.height / 2;
    
    // Define safe zones - divide container into regions away from Yes button
    const margin = 40;
    const minDistanceFromYes = 280; // Large minimum distance
    
    // Try to find a valid position
    let validPosition = false;
    let newLeft, newTop;
    let attempts = 0;
    const maxAttempts = 30;
    
    while (!validPosition && attempts < maxAttempts) {
        attempts++;
        
        // Generate random position within container bounds
        newLeft = margin + Math.random() * (containerRect.width - btnWidth - 2 * margin);
        newTop = margin + Math.random() * (containerRect.height - btnHeight - 2 * margin);
        
        // Calculate center of No button at this position
        const noCenterX = newLeft + btnWidth / 2;
        const noCenterY = newTop + btnHeight / 2;
        
        // Calculate distance from Yes button
        const distance = Math.sqrt(
            Math.pow(noCenterX - yesCenterX, 2) + 
            Math.pow(noCenterY - yesCenterY, 2)
        );
        
        // Check if position is valid (far enough from Yes)
        if (distance >= minDistanceFromYes) {
            validPosition = true;
        }
    }
    
    // If no valid position found (unlikely), force it to a corner far from Yes
    if (!validPosition) {
        // Determine which corner is farthest from Yes button
        const corners = [
            { left: margin, top: margin }, // Top-left
            { left: containerRect.width - btnWidth - margin, top: margin }, // Top-right
            { left: margin, top: containerRect.height - btnHeight - margin }, // Bottom-left
            { left: containerRect.width - btnWidth - margin, top: containerRect.height - btnHeight - margin } // Bottom-right
        ];
        
        // Find farthest corner
        let maxDistance = 0;
        let bestCorner = corners[0];
        
        corners.forEach(corner => {
            const cornerCenterX = corner.left + btnWidth / 2;
            const cornerCenterY = corner.top + btnHeight / 2;
            const dist = Math.sqrt(
                Math.pow(cornerCenterX - yesCenterX, 2) + 
                Math.pow(cornerCenterY - yesCenterY, 2)
            );
            if (dist > maxDistance) {
                maxDistance = dist;
                bestCorner = corner;
            }
        });
        
        newLeft = bestCorner.left;
        newTop = bestCorner.top;
    }
    
    // Apply absolute positioning
    btn.style.left = newLeft + 'px';
    btn.style.top = newTop + 'px';
    btn.style.transform = 'none'; // Clear any previous transforms
    
    // Remove moving class after animation
    setTimeout(() => {
        btn.classList.remove('moving');
    }, 300);
}

// Handle "No" button click - only works after 3-4 shifts
function handleNoClick(btn, nextPage) {
    const buttonId = btn.getAttribute('data-page');
    const shiftCount = buttonShiftCounts.get(buttonId) || 0;
    
    // Require 3-4 shifts for fair gameplay
    let requiredShifts = 3;
    if (buttonId === '6') requiredShifts = 4; // First page needs 4 shifts
    if (buttonId === '7') requiredShifts = 3; // Second page needs 3 shifts
    if (buttonId === '8') requiredShifts = 3; // Third page needs 3 shifts
    if (buttonId === '9') requiredShifts = 3; // Fourth page needs 3 shifts
    
    // Check if enough shifts have been made
    if (shiftCount >= requiredShifts) {
        // Enough shifts! Allow click
        console.log(`✅ Button clicked! Moving to next page...`);
        goToPage(nextPage);
    } else {
        // Not enough shifts - show console message
        const remaining = requiredShifts - shiftCount;
        console.log(`❌ Button moved ${shiftCount} time(s). Need ${remaining} more shift(s) to make it clickable! Hover over it to move it again. 😄`);
        
        // Visual shake effect to show it's not clickable yet
        btn.style.animation = 'shake 0.3s';
        setTimeout(() => {
            btn.style.animation = '';
        }, 300);
    }
}

// Create confetti effect
function createConfetti() {
    const confettiContainer = document.getElementById('confetti');
    const colors = ['#ff6b9d', '#ffc2d1', '#ffb5a7', '#c779d0', '#50c878', '#90ee90'];
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        confettiContainer.appendChild(confetti);
    }
}

// Initialize
createFloatingHearts();
updateProgress();

// Add sparkles randomly
setInterval(() => {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.textContent = '✨';
    sparkle.style.left = Math.random() * 100 + '%';
    sparkle.style.top = Math.random() * 100 + '%';
    document.body.appendChild(sparkle);
    
    setTimeout(() => sparkle.remove(), 3000);
}, 2000);