// Telegram Web App initialization
let tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

// Apply Telegram theme
document.documentElement.style.setProperty('--tg-theme-bg-color', tg.backgroundColor || '#ffffff');
document.documentElement.style.setProperty('--tg-theme-text-color', tg.textColor || '#000000');
document.documentElement.style.setProperty('--tg-theme-hint-color', tg.hintColor || '#707579');
document.documentElement.style.setProperty('--tg-theme-link-color', tg.linkColor || '#3390ec');
document.documentElement.style.setProperty('--tg-theme-button-color', tg.buttonColor || '#3390ec');
document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.buttonTextColor || '#ffffff');
document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.secondaryBackgroundColor || '#f4f4f5');

// Load current configuration
window.addEventListener('DOMContentLoaded', () => {
    loadCurrentConfig();
});

function loadCurrentConfig() {
    // Get current config from Telegram Web App init data
    const initData = tg.initDataUnsafe;
    
    // Request current status from bot
    tg.sendData(JSON.stringify({
        action: 'get_status'
    }));
    
    // Set default status
    document.getElementById('current-status').textContent = 'Gateway Active';
    
    // Simulate loading current config (will be replaced with actual bot response)
    setTimeout(() => {
        document.getElementById('current-status').textContent = '✅ Gateway Active';
    }, 1000);
}

function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const button = event.target;
    
    if (field.type === 'password') {
        field.type = 'text';
        button.textContent = '🙈';
    } else {
        field.type = 'password';
        button.textContent = '👁️';
    }
}

async function saveConfig() {
    const wifiSsid = document.getElementById('wifi-ssid').value.trim();
    const wifiPassword = document.getElementById('wifi-password').value;
    const botToken = document.getElementById('bot-token').value.trim();
    const chatId = document.getElementById('chat-id').value.trim();
    const loraRegion = parseInt(document.getElementById('lora-region').value);
    const loraModem = parseInt(document.getElementById('lora-modem').value);
    
    // Validation
    if (!wifiSsid) {
        showError('Please enter WiFi SSID');
        return;
    }
    
    if (!botToken || !chatId) {
        showError('Please enter Telegram bot credentials');
        return;
    }
    
    if (loraRegion === 0) {
        showError('Please select a LoRa region');
        return;
    }
    
    const config = {
        action: 'save_config',
        wifi_ssid: wifiSsid,
        wifi_password: wifiPassword,
        bot_token: botToken,
        chat_id: chatId,
        lora_region: loraRegion,
        lora_modem: loraModem
    };
    
    // Show loading
    showLoading();
    
    try {
        // Send configuration to bot
        // The bot will forward this to the ESP32 device
        tg.sendData(JSON.stringify(config));
        
        // Show success after a delay (simulating device response)
        setTimeout(() => {
            hideLoading();
            showSuccess();
            
            // Close the web app after 3 seconds
            setTimeout(() => {
                tg.close();
            }, 3000);
        }, 2000);
        
    } catch (error) {
        hideLoading();
        showError('Failed to save configuration: ' + error.message);
    }
}

function closeApp() {
    if (confirm('Close without saving?')) {
        tg.close();
    }
}

function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('save-btn').disabled = true;
    document.getElementById('cancel-btn').disabled = true;
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('save-btn').disabled = false;
    document.getElementById('cancel-btn').disabled = false;
}

function showSuccess() {
    document.getElementById('success').classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('success').classList.add('hidden');
    }, 5000);
}

function showError(message) {
    document.getElementById('error-message').textContent = message;
    document.getElementById('error').classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('error').classList.add('hidden');
    }, 5000);
}

// Handle messages from Telegram Bot (status updates)
window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'config_status') {
        const status = event.data.data;
        
        // Update current status display
        document.getElementById('current-status').textContent = '✅ Gateway Active';
        
        // Pre-fill form if available
        if (status.wifi_ssid) {
            document.getElementById('wifi-ssid').value = status.wifi_ssid;
        }
        if (status.chat_id) {
            document.getElementById('chat-id').value = status.chat_id;
        }
        if (status.lora_region) {
            document.getElementById('lora-region').value = status.lora_region;
        }
        if (status.lora_modem !== undefined) {
            document.getElementById('lora-modem').value = status.lora_modem;
        }
    }
});

// Notify Telegram that the app is ready
tg.ready();
