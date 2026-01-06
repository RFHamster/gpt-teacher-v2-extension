import * as vscode from 'vscode';
import * as fs from 'fs';

export interface PageAssets {
    css: string;
    cssPath: vscode.Uri;
    js: string;
    jsPath: vscode.Uri;
}

export abstract class BasePage {
    constructor(protected extensionUri: vscode.Uri) {}

    abstract render(data?: any): string;
    abstract getPageName(): string;

    protected getNonce(): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    protected getAssets(): PageAssets {
        const pageName = this.getPageName();
        const pagesPath = vscode.Uri.joinPath(this.extensionUri, 'src', 'pages', pageName);

        const cssPath = vscode.Uri.joinPath(pagesPath, `${pageName}.css`);
        const jsPath = vscode.Uri.joinPath(pagesPath, `${pageName}.js`);

        let css = '';
        let js = '';

        try {
            css = fs.readFileSync(cssPath.fsPath, 'utf8');
            console.log(`✅ CSS loaded for ${pageName}: ${css.length} bytes`);
        } catch (error) {
            console.error(`❌ CSS not found for page: ${pageName} at ${cssPath.fsPath}`, error);
        }

        try {
            js = fs.readFileSync(jsPath.fsPath, 'utf8');
            console.log(`✅ JS loaded for ${pageName}: ${js.length} bytes`);
        } catch (error) {
            console.error(`❌ JS not found for page: ${pageName} at ${jsPath.fsPath}`, error);
        }

        return { css, cssPath, js, jsPath };
    }

    public renderComplete(webview: vscode.Webview, data?: any, cspSource?: string): string {
        const assets = this.getAssets();
        
        const nonce = this.getNonce();
        const content = this.render(data);
        const styleResetUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, 'media', 'reset.css')
        );
        const styleVSCodeUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, 'media', 'vscode.css')
        );
        const styleCSSUri = webview.asWebviewUri(assets.cssPath);
        const styleJSUri = webview.asWebviewUri(assets.jsPath);
        const html = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource || "'unsafe-inline'"}; script-src 'nonce-${nonce}';">
                <title>GPT Teacher</title>
                <link rel="stylesheet" href="${styleResetUri}">
                <link rel="stylesheet" href="${styleVSCodeUri}">
                <link rel="stylesheet" href="${styleCSSUri}">
            </head>
            <body>
                <div class="container">
                    ${content}
                </div>
                <script nonce="${nonce}" src="${styleJSUri}"></script>
            </body>
            </html>
        `;

        return html;
    }
}
