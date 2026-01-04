export type ParticleShape =
    'sphere' | 'cube' | 'tunnel' | 'dna' | 'vortex' | 'grid' | 'scatter' |
    'torus' | 'galaxy' | 'pyramid' | 'hourglass' | 'cross' |
    'knot' | 'star' | 'spiral' | 'wave' | 'fountain' | 'cube_hollow' | 'ring' |
    'monolith' | 'spikes' | 'shards' | 'prism' | 'structure';

export const generateShape = (type: ParticleShape, count: number): Float32Array => {
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        switch (type) {
            case 'sphere': {
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos((Math.random() * 2) - 1);
                const r = 8;
                positions[i3] = r * Math.sin(phi) * Math.cos(theta);
                positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
                positions[i3 + 2] = r * Math.cos(phi);
                break;
            }
            case 'cube': {
                const size = 10;
                positions[i3] = (Math.random() - 0.5) * size;
                positions[i3 + 1] = (Math.random() - 0.5) * size;
                positions[i3 + 2] = (Math.random() - 0.5) * size;
                break;
            }
            case 'tunnel': {
                const angle = (i / count) * Math.PI * 40;
                const r = 5 + Math.random();
                const z = ((i / count) * 100) - 50;
                positions[i3] = Math.cos(angle) * r;
                positions[i3 + 1] = Math.sin(angle) * r;
                positions[i3 + 2] = z;
                break;
            }
            case 'dna': {
                const t = (i / count) * Math.PI * 20;
                const r = 3;
                const strand = i % 2 === 0 ? 1 : -1;
                const y = ((i / count) * 40) - 20;
                positions[i3] = Math.cos(t) * r * strand;
                positions[i3 + 1] = y;
                positions[i3 + 2] = Math.sin(t) * r * strand;
                break;
            }
            case 'vortex': {
                const angle = i * 0.1;
                const r = (i / count) * 15;
                positions[i3] = Math.cos(angle) * r;
                positions[i3 + 1] = (Math.random() - 0.5) * 5;
                positions[i3 + 2] = Math.sin(angle) * r;
                break;
            }
            case 'grid': {
                const side = Math.sqrt(count);
                const x = (i % side) - (side / 2);
                const z = (Math.floor(i / side)) - (side / 2);
                positions[i3] = x * 0.5;
                positions[i3 + 1] = 0;
                positions[i3 + 2] = z * 0.5;
                break;
            }
            case 'torus': {
                const u = Math.random() * Math.PI * 2;
                const v = Math.random() * Math.PI * 2;
                const R = 8;
                const r = 3;
                positions[i3] = (R + r * Math.cos(v)) * Math.cos(u);
                positions[i3 + 1] = (R + r * Math.cos(v)) * Math.sin(u);
                positions[i3 + 2] = r * Math.sin(v);
                break;
            }
            case 'galaxy': {
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.pow(Math.random(), 0.5) * 20;
                const spiral = distance * 0.5;
                const thickness = (1 - (distance / 20)) * 2;
                positions[i3] = Math.cos(angle + spiral) * distance;
                positions[i3 + 1] = (Math.random() - 0.5) * thickness;
                positions[i3 + 2] = Math.sin(angle + spiral) * distance;
                break;
            }
            case 'pyramid': {
                const h = 10;
                const y = Math.random() * h;
                const width = h - y;
                const x = (Math.random() - 0.5) * width;
                const z = (Math.random() - 0.5) * width;
                positions[i3] = x;
                positions[i3 + 1] = y - h / 2;
                positions[i3 + 2] = z;
                break;
            }
            case 'hourglass': {
                const h = 10;
                const y = (Math.random() - 0.5) * h * 2;
                const r = Math.abs(y * 0.8) + 0.5;
                const theta = Math.random() * Math.PI * 2;
                positions[i3] = Math.cos(theta) * r;
                positions[i3 + 1] = y;
                positions[i3 + 2] = Math.sin(theta) * r;
                break;
            }
            case 'cross': {
                const axis = Math.floor(Math.random() * 3);
                const size = 15;
                positions[i3] = axis === 0 ? (Math.random() - 0.5) * size : (Math.random() - 0.5) * 2;
                positions[i3 + 1] = axis === 1 ? (Math.random() - 0.5) * size : (Math.random() - 0.5) * 2;
                positions[i3 + 2] = axis === 2 ? (Math.random() - 0.5) * size : (Math.random() - 0.5) * 2;
                break;
            }
            case 'knot': {
                const t = (i / count) * Math.PI * 2;
                const x = Math.sin(t) + 2 * Math.sin(2 * t);
                const y = Math.cos(t) - 2 * Math.cos(2 * t);
                const z = -Math.sin(3 * t);
                positions[i3] = x * 4;
                positions[i3 + 1] = y * 4;
                positions[i3 + 2] = z * 4;
                break;
            }
            case 'star': {
                const points = 5;
                const r = (i % 2 === 0) ? 10 : 4;
                const angle = Math.floor(Math.random() * points) * (Math.PI * 2 / points);
                positions[i3] = Math.cos(angle) * r + (Math.random() - 0.5) * 2;
                positions[i3 + 1] = Math.sin(angle) * r + (Math.random() - 0.5) * 2;
                positions[i3 + 2] = (Math.random() - 0.5) * 5;
                break;
            }
            case 'spiral': {
                const t = (i / count) * Math.PI * 20;
                const r = t * 0.8;
                positions[i3] = Math.cos(t) * r;
                positions[i3 + 1] = Math.sin(t) * r;
                positions[i3 + 2] = (Math.random() - 0.5) * 2;
                break;
            }
            case 'wave': {
                const x = ((i / count) * 40) - 20;
                const z = (Math.random() - 0.5) * 20;
                const y = Math.sin(x * 0.5) * 5 + Math.cos(z * 0.5) * 5;
                positions[i3] = x;
                positions[i3 + 1] = y;
                positions[i3 + 2] = z;
                break;
            }
            case 'fountain': {
                const t = Math.random() * Math.PI * 2;
                const r = Math.pow(Math.random(), 0.5) * 5;
                const h = 20 * Math.random();
                positions[i3] = Math.cos(t) * r * (h * 0.1);
                positions[i3 + 1] = h - 10;
                positions[i3 + 2] = Math.sin(t) * r * (h * 0.1);
                break;
            }
            case 'cube_hollow': {
                const side = Math.floor(Math.random() * 3);
                const pos = Math.random() > 0.5 ? 5 : -5;
                positions[i3] = side === 0 ? pos : (Math.random() - 0.5) * 10;
                positions[i3 + 1] = side === 1 ? pos : (Math.random() - 0.5) * 10;
                positions[i3 + 2] = side === 2 ? pos : (Math.random() - 0.5) * 10;
                break;
            }
            case 'ring': {
                const t = Math.random() * Math.PI * 2;
                const r = 12 + (Math.random() - 0.5) * 0.5;
                positions[i3] = Math.cos(t) * r;
                positions[i3 + 1] = (Math.random() - 0.5) * 0.5;
                positions[i3 + 2] = Math.sin(t) * r;
                break;
            }
            case 'monolith': {
                const xPos = (Math.floor(i / (count / 5)) - 2) * 15;
                positions[i3] = xPos + (Math.random() - 0.5) * 2;
                positions[i3 + 1] = (Math.random() - 0.5) * 40;
                positions[i3 + 2] = (Math.random() - 0.5) * 2;
                break;
            }
            case 'spikes': {
                const angle = Math.random() * Math.PI * 2;
                const h = 30 * Math.pow(Math.random(), 2);
                positions[i3] = Math.cos(angle) * (h * 0.2);
                positions[i3 + 1] = h - 15;
                positions[i3 + 2] = Math.sin(angle) * (h * 0.2);
                break;
            }
            case 'shards': {
                const angle = Math.random() * Math.PI * 2;
                const r = 5 + Math.random() * 20;
                const y = (Math.random() - 0.5) * 10;
                positions[i3] = Math.cos(angle) * r;
                positions[i3 + 1] = y + Math.sin(angle * 4) * 5;
                positions[i3 + 2] = Math.sin(angle) * r;
                break;
            }
            case 'prism': {
                const side = i % 3;
                const h = 20 * Math.random();
                const angle = (side * Math.PI * 2) / 3;
                positions[i3] = Math.cos(angle) * (h * 0.5);
                positions[i3 + 1] = h - 10;
                positions[i3 + 2] = Math.sin(angle) * (h * 0.5);
                break;
            }
            case 'structure': {
                const step = 5;
                const x = ((i % 10) - 5) * step;
                const y = (Math.floor((i % 100) / 10) - 5) * step;
                const z = (Math.floor(i / 100) % 10 - 5) * step;
                positions[i3] = x + (Math.random() - 0.5);
                positions[i3 + 1] = y + (Math.random() - 0.5);
                positions[i3 + 2] = z + (Math.random() - 0.5);
                break;
            }
            case 'scatter':
            default: {
                positions[i3] = (Math.random() - 0.5) * 50;
                positions[i3 + 1] = (Math.random() - 0.5) * 50;
                positions[i3 + 2] = (Math.random() - 0.5) * 50;
                break;
            }
        }
    }
    return positions;
};
