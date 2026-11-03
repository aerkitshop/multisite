import * as migration_20261103_150039_initial from './20261103_150039_initial';

export const migrations = [
  {
    up: migration_20261103_150039_initial.up,
    down: migration_20261103_150039_initial.down,
    name: '20261103_150039_initial'
  },
];
