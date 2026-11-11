import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const deployDir = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(deployDir, '..');

const readRepoFile = (relativePath: string): string =>
    readFileSync(path.join(frontendRoot, relativePath), 'utf8');

describe('production frontend image', () => {
    it('builds only public Vite values and serves the SPA from nginx', () => {
        const dockerfile = readRepoFile('Dockerfile.prod');
        const nginx = readRepoFile('deploy/nginx.prod.conf');

        expect(dockerfile).toContain('npx vite build');
        expect(dockerfile).toContain('VITE_API_BASE_URL');
        expect(dockerfile).toContain('VITE_BACKEND_URL');
        expect(dockerfile).toContain('VITE_REVERB_APP_KEY');
        expect(dockerfile).toContain('VITE_REVERB_HOST');
        expect(dockerfile).toContain('VITE_REVERB_PORT');
        expect(dockerfile).toContain('VITE_REVERB_SCHEME');
        expect(dockerfile).not.toContain('VITE_OPENAI_API_KEY');
        expect(dockerfile).not.toContain('REVERB_APP_SECRET');
        expect(dockerfile).not.toContain('OPENAI_API_KEY');
        expect(dockerfile).toContain('nginx:');
        expect(nginx).toContain('try_files $uri $uri/ /index.html');
        expect(nginx).toContain('location /api/');
        expect(nginx).not.toContain('proxy_pass');
        expect(nginx).not.toContain('OPENAI_API_KEY');
    });

    it('rejects a dist that contains a backend secret marker', () => {
        const directory = mkdtempSync(path.join(tmpdir(), 'foxaldb-dist-'));
        writeFileSync(
            path.join(directory, 'app.js'),
            'const leaked = "REVERB_APP_SECRET";'
        );

        expect(() =>
            execFileSync('sh', ['deploy/check-dist-secrets.sh', directory], {
                cwd: frontendRoot,
                stdio: 'pipe',
            })
        ).toThrow();

        rmSync(directory, { recursive: true, force: true });
    });

    it('accepts a dist without secret markers', () => {
        const directory = mkdtempSync(path.join(tmpdir(), 'foxaldb-dist-'));
        writeFileSync(path.join(directory, 'app.js'), 'const key = undefined;');

        execFileSync('sh', ['deploy/check-dist-secrets.sh', directory], {
            cwd: frontendRoot,
            stdio: 'pipe',
        });

        rmSync(directory, { recursive: true, force: true });
    });
});
