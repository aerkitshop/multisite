import * as migration_20261103_150039_initial from './20261103_150039_initial';
import * as migration_20261105_032810_tool_cover_tagline from './20261105_032810_tool_cover_tagline';

export const migrations = [
  {
    up: migration_20261103_150039_initial.up,
    down: migration_20261103_150039_initial.down,
    name: '20261103_150039_initial',
  },
  {
    up: migration_20261105_032810_tool_cover_tagline.up,
    down: migration_20261105_032810_tool_cover_tagline.down,
    name: '20261105_032810_tool_cover_tagline'
  },
];
