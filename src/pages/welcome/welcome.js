// Welcome Screen Script
(function() {
    const vscode = acquireVsCodeApi();

    const loginBtn = document.getElementById('loginBtn');
    
    loginBtn.addEventListener('click', () => {
        vscode.postMessage({ type: 'login' });
    });
})();