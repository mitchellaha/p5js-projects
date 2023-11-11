import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'node:url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const allProjects = fs.readdirSync(path.resolve(__dirname, 'projects')).map((project) => {
    if (project === '.DS_Store') {
        return null;
    }
    return {
        name: project,
        path: path.resolve(__dirname, `projects/${project}/index.html`),
    };
});
const projects = allProjects.filter((project) => project !== null);

export default defineConfig({
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'index.html'),
                ...projects.reduce((acc, project) => {
                    acc[project.name] = project.path;
                    return acc;
                }, {}),
            },
        },
    },
});
