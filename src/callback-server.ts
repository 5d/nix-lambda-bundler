import * as fs from 'node:fs/promises';
import * as http from 'node:http';
import { AddressInfo } from 'node:net';
import * as path from 'node:path';

// Handle the file upload stream
const handleFileUpload = async (
    req: http.IncomingMessage,
    destFilePath: string
): Promise<{ fileName: string, fileSize: number }> => {
    const fileName = path.basename(destFilePath)
    const fileHandle = await fs.open(destFilePath, 'w');
    const writeStream = fileHandle.createWriteStream();
    console.log('Writing file:', fileName)
    return new Promise((resolve, reject) => {
        let fileSize = 0;

        req.on('data', chunk => {
            fileSize += chunk.length;
            writeStream.write(chunk);
        });

        req.on('end', async () => {
            writeStream.end();
            await fileHandle.close();
            resolve({ fileName, fileSize });
        });

        req.on('error', async (error) => {
            writeStream.end();
            await fileHandle.close();
            try {
                await fs.unlink(fileName);
            } catch (unlinkError) {
                console.error('Cleanup error:', unlinkError);
            }
            console.error('Failed to handle request with error', error)
            reject(error);
        });
    });
};

// Graceful server shutdown
const shutdownServer = async (server: http.Server) => {
    console.log('Upload complete, shutting down server...');

    return new Promise((resolve) => {
        server.close(() => {
            console.log('Server closed');
            resolve(null);
        });
    });
};

const createServer = async (destFilePath: string) => {
    const server = http.createServer(async (req, res) => {
        try {
            if (req.method !== 'POST') {
                res.writeHead(405, { 'content-type': 'application/json' })
                res.end(JSON.stringify({ error: 'Method not allowed' }))
                return
            }

            const uploadResult = await handleFileUpload(req, destFilePath)
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                message: 'File uploaded successfully',
                fileName: uploadResult.fileName,
                size: uploadResult.fileSize
            }));

            await shutdownServer(server)
        } catch (error) {
            console.error('Request error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Upload failed' }));
        }
    })
    return server
}

export const startCallbackServer = async (host: string, destFilePath: string): Promise<number> => {
    try {
        const server = await createServer(destFilePath)
        return new Promise((resolve, reject) => {
            server.listen(0, host, () => {
                try {
                    const address = server.address() as AddressInfo;
                    console.log(`Callback server start listening on port: ${address.port}`);
                    resolve(address.port)
                } catch (error) {
                    reject(error)
                }
            })
        })
    } catch (error) {
        console.error('Server startup error:', error);
        throw error;
    }
}
