import { Profile } from '../types';

export const DEMO_PROFILES: Profile[] = [
  {
    id: 'd0000000-0000-0000-0000-000000000001',
    name: 'Alex Chen',
    email: 'student@sharespace.demo',
    role: 'user',
    trained: false,
    verified: true,
    points: 35,
  },
  {
    id: 'd0000000-0000-0000-0000-000000000002',
    name: 'Prof. Elena Rostova',
    email: 'owner@sharespace.demo',
    role: 'user',
    trained: true,
    verified: true,
    points: 180,
  },
  {
    id: 'd0000000-0000-0000-0000-000000000003',
    name: 'Riya Sharma',
    email: 'riya@sharespace.demo',
    role: 'user',
    trained: true,
    verified: false,
    points: 75,
  },
  {
    id: 'd0000000-0000-0000-0000-000000000004',
    name: 'Marcus Vance (Campus Admin)',
    email: 'admin@sharespace.demo',
    role: 'admin',
    trained: true,
    verified: true,
    points: 320,
  },
];
