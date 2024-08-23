import { exec } from 'child_process';

class Window {
    public openWindow(url: string): void {
        if (!url) {
            return;
        }

        const platform = process.platform;

        let command = '';

        if (platform === 'win32') {
            command = `start "" "${url}"`;
        } else if (platform === 'darwin') {
            command = `open "${url}"`;
        } else if (platform === 'linux') {
            command = `xdg-open "${url}"`;
        }

        exec(command, (err) => {
            if (err) {
                console.error('Failed to open URL:', err);
            }
        });
    }
}

export default new Window();