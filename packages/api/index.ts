'use strict';
import { start, init } from './server';

(async (): Promise<void> => {
  await init();
  await start();
})();
