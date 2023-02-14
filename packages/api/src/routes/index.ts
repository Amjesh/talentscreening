const v1 = `/v1`;
import health from './health';
export default [
  {
    plugin: health,
    routes: {
      prefix: `${v1}/health`
    }
  }
];
